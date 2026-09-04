using HappyVeggie.Application.AI.Context;
using HappyVeggie.Application.AI.Options;
using HappyVeggie.Application.AI.Prompts;
using HappyVeggie.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace HappyVeggie.Application.AI.Services;

/// <summary>
/// Farm-scoped AI assistant (Doc 04 §3 / GAP-032).
/// Bound to the selected farm twin only; production area types in context;
/// always returns disclaimer metadata for stub/live.
/// </summary>
public sealed class FarmAssistantService
{
    public const string AdvisoryDisclaimer =
        "AI-generated. Not professional agricultural advice.";

    private readonly ILlmProvider _llm;
    private readonly FarmContextBuilder _contextBuilder;
    private readonly AssistantResponseValidator _validator;
    private readonly LlmUsageLogger _usageLogger;
    private readonly IApplicationDbContext _db;
    private readonly LlmProviderOptions _options;

    public FarmAssistantService(
        ILlmProvider llm,
        FarmContextBuilder contextBuilder,
        AssistantResponseValidator validator,
        LlmUsageLogger usageLogger,
        IApplicationDbContext db,
        IOptions<LlmProviderOptions> options)
    {
        _llm = llm;
        _contextBuilder = contextBuilder;
        _validator = validator;
        _usageLogger = usageLogger;
        _db = db;
        _options = options.Value;
    }

    public async Task<AssistantReply> RespondAsync(
        Guid farmId, Guid threadId, string userMessage, string language,
        CancellationToken cancellationToken)
    {
        // Bind to this farm's twin only (owner-scoped upstream)
        var thread = await _db.AssistantThreads.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == threadId && t.FarmId == farmId, cancellationToken)
            ?? throw new KeyNotFoundException($"Thread {threadId} not found for farm {farmId}.");

        var context = await _contextBuilder.BuildAsync(farmId, cancellationToken);
        var contextText = FarmContextBuilder.ToPromptText(context);

        var history = await _db.AssistantMessages.AsNoTracking()
            .Where(m => m.ThreadId == thread.Id)
            .OrderByDescending(m => m.CreatedAt)
            .Take(_options.ConversationWindowTurns * 2)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new LlmMessage(m.Role.ToString().ToLowerInvariant(), m.Content))
            .ToListAsync(cancellationToken);

        var protectedTypes = context.ProductionAreas
            .Select(a => a.TypeCode)
            .Where(t => !string.Equals(t, "open_field", StringComparison.OrdinalIgnoreCase))
            .Distinct()
            .ToList();

        var areaGuard = protectedTypes.Count > 0
            ? $"Protected environment types on this farm: {string.Join(", ", protectedTypes)}. Do not assume outdoor field conditions for those areas."
            : "All listed areas are open_field unless otherwise stated.";

        var messages = new List<LlmMessage>
        {
            new("system", PromptTemplates.AssistantSystem(language)),
            new("system", areaGuard),
            new("system", contextText)
        };
        messages.AddRange(history);
        messages.Add(new("user", userMessage));

        var opts = new LlmOptions
        {
            Model = _options.Model,
            MaxTokens = _options.MaxTokensChat,
            Temperature = _options.Temperature,
            Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds),
            RequestType = "assistant_chat"
        };

        var response = await _llm.CompleteChatAsync(messages, opts, cancellationToken);
        _usageLogger.LogChatUsage("assistant_chat", response, farmId: farmId);

        var validation = _validator.Validate(response.Content, farmId);
        var citations = AssistantResponseValidator.ExtractCitations(response.Content);

        // Always surface disclaimer in metadata (stub and live)
        var content = validation.Content;
        if (!content.Contains("not professional", StringComparison.OrdinalIgnoreCase) &&
            !content.Contains("AI-generated", StringComparison.OrdinalIgnoreCase))
        {
            content = content + "\n\n" + AdvisoryDisclaimer;
        }

        return new AssistantReply(
            content,
            citations,
            validation.IsClean,
            validation.Issues,
            AdvisoryDisclaimer);
    }
}

public sealed record AssistantReply(
    string Content,
    IReadOnlyList<string> Citations,
    bool IsClean,
    IReadOnlyList<string> ValidationIssues,
    string Disclaimer);
