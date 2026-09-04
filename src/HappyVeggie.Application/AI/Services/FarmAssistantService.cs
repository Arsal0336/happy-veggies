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

        var replyLanguage = ResolveReplyLanguage(language, userMessage);
        var disclaimer = replyLanguage == "ur"
            ? "یہ مصنوعی ذہانت سے تیار کردہ مشاورتی مواد ہے۔ پیشہ ورانہ زرعی مشورہ نہیں۔"
            : AdvisoryDisclaimer;

        var context = await _contextBuilder.BuildAsync(farmId, cancellationToken);
        var contextText = FarmContextBuilder.ToPromptText(context);

        var historyRows = await _db.AssistantMessages.AsNoTracking()
            .Where(m => m.ThreadId == thread.Id)
            .ToListAsync(cancellationToken);

        var history = historyRows
            .OrderByDescending(m => m.CreatedAt)
            .Take(_options.ConversationWindowTurns * 2)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new LlmMessage(m.Role.ToString().ToLowerInvariant(), m.Content))
            .ToList();

        var protectedTypes = context.ProductionAreas
            .Select(a => a.TypeCode)
            .Where(t => !string.Equals(t, "open_field", StringComparison.OrdinalIgnoreCase))
            .Distinct()
            .ToList();

        var areaGuard = protectedTypes.Count > 0
            ? $"Protected environment types on this farm: {string.Join(", ", protectedTypes)}. Do not assume outdoor field conditions for those areas."
            : "All listed areas are open_field unless otherwise stated.";

        var languageGuard = replyLanguage == "ur"
            ? "The farmer's latest message is in Urdu (or Urdu is required). Write the entire assistant answer, headings, lists, table cells, and follow-up chips in Urdu. Follow-up chips must be first-person sendable requests (میں چاہتا/چاہتی ہوں… / مجھے بتائیں…), not questions to the farmer."
            : "Write the assistant answer in clear English unless the user explicitly asks for another language. Follow-up chips must be first-person sendable requests (I want… / Tell me… / Give me…), not questions to the farmer.";

        var messages = new List<LlmMessage>
        {
            new("system", PromptTemplates.AssistantSystem(replyLanguage)),
            new("system", languageGuard),
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

        // Always surface disclaimer in metadata (stub and live)
        var content = validation.Content;
        if (!content.Contains("not professional", StringComparison.OrdinalIgnoreCase) &&
            !content.Contains("AI-generated", StringComparison.OrdinalIgnoreCase) &&
            !content.Contains("پیشہ ورانہ زرعی", StringComparison.OrdinalIgnoreCase) &&
            !content.Contains("مصنوعی ذہانت", StringComparison.OrdinalIgnoreCase))
        {
            content = content + "\n\n" + disclaimer;
        }

        var (cleanContent, followUps) = FollowUpQuestionsParser.Extract(content);
        var citations = AssistantResponseValidator.ExtractCitations(cleanContent);
        if (followUps.Count == 0)
        {
            followUps = DefaultFollowUps(replyLanguage, userMessage, context.CropZones.FirstOrDefault()?.CropName);
        }

        return new AssistantReply(
            cleanContent,
            citations,
            validation.IsClean,
            validation.Issues,
            disclaimer,
            followUps);
    }

    private static string ResolveReplyLanguage(string profileLanguage, string userMessage)
    {
        if (ContainsArabicScript(userMessage))
        {
            return "ur";
        }

        // Clear Latin/English question should stay English even if profile is Urdu.
        if (LooksPrimarilyLatin(userMessage))
        {
            return "en";
        }

        return string.Equals(profileLanguage, "ur", StringComparison.OrdinalIgnoreCase) ? "ur" : "en";
    }

    private static bool ContainsArabicScript(string text)
        => text.Any(static c =>
            c is (>= '\u0600' and <= '\u06FF')
                or (>= '\u0750' and <= '\u077F')
                or (>= '\u08A0' and <= '\u08FF'));

    private static bool LooksPrimarilyLatin(string text)
    {
        var letters = text.Where(char.IsLetter).ToList();
        if (letters.Count < 3)
        {
            return false;
        }

        var latin = letters.Count(static c => c <= 0x024F);
        return latin >= letters.Count * 0.8;
    }

    private static IReadOnlyList<string> DefaultFollowUps(string language, string userMessage, string? crop)
    {
        var cropLabel = string.IsNullOrWhiteSpace(crop) ? (language == "ur" ? "فصل" : "crop") : crop!;
        if (language == "ur")
        {
            return
            [
                $"مجھے {cropLabel} کی آبپاشی کا وقت بتائیں",
                "اس ہفتے موسمی خطرے کا مشورہ دیں",
                "فارم کے لیے اگلا عملی قدم بتائیں"
            ];
        }

        var q = userMessage.ToLowerInvariant();
        if (q.Contains("irrig") || q.Contains("water") || q.Contains("آبپاشی") || q.Contains("پانی"))
        {
            return
            [
                $"I want this week's water need for my {cropLabel}",
                "Tell me whether to skip irrigation after rain",
                "Give me the next twin signal to check"
            ];
        }

        return
        [
            $"I want irrigation timing for my {cropLabel}",
            "Tell me how to handle heat on this farm",
            "Give me the next practical step for my zones"
        ];
    }
}

public sealed record AssistantReply(
    string Content,
    IReadOnlyList<string> Citations,
    bool IsClean,
    IReadOnlyList<string> ValidationIssues,
    string Disclaimer,
    IReadOnlyList<string> FollowUpQuestions);
