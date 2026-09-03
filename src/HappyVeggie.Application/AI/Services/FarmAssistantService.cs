using HappyVeggie.Application.AI.Context;
using HappyVeggie.Application.AI.Options;
using HappyVeggie.Application.AI.Prompts;
using HappyVeggie.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace HappyVeggie.Application.AI.Services;

/// <summary>
/// Farm-scoped AI assistant service (Doc 04 §3).
/// Builds context, assembles prompt with history, calls LLM, validates response.
/// </summary>
public sealed class FarmAssistantService
{
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
        // 1. Build farm context
        var context = await _contextBuilder.BuildAsync(farmId, cancellationToken);
        var contextText = FarmContextBuilder.ToPromptText(context);

        // 2. Get conversation history (last N turns)
        var history = await _db.AssistantMessages.AsNoTracking()
            .Where(m => m.ThreadId == threadId)
            .OrderByDescending(m => m.CreatedAt)
            .Take(_options.ConversationWindowTurns * 2)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new LlmMessage(m.Role.ToString().ToLowerInvariant(), m.Content))
            .ToListAsync(cancellationToken);

        // 3. Assemble messages
        var messages = new List<LlmMessage>
        {
            new("system", PromptTemplates.AssistantSystem(language)),
            new("system", contextText)
        };
        messages.AddRange(history);
        messages.Add(new("user", userMessage));

        // 4. Call LLM
        var opts = new LlmOptions
        {
            Model = _options.Model,
            MaxTokens = _options.MaxTokensChat,
            Temperature = _options.Temperature,
            Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds),
            RequestType = "assistant_chat"
        };

        var response = await _llm.CompleteChatAsync(messages, opts, cancellationToken);
        _usageLogger.LogChatUsage("assistant_chat", response);

        // 5. Validate response
        var validation = _validator.Validate(response.Content, farmId);
        var citations = AssistantResponseValidator.ExtractCitations(response.Content);

        return new AssistantReply(
            validation.Content,
            citations,
            validation.IsClean,
            validation.Issues);
    }
}

public sealed record AssistantReply(
    string Content,
    IReadOnlyList<string> Citations,
    bool IsClean,
    IReadOnlyList<string> ValidationIssues);
