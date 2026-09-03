using HappyVeggie.Application.AI.Context;
using HappyVeggie.Application.AI.Options;
using HappyVeggie.Application.AI.Prompts;
using HappyVeggie.Application.AI.Schemas;
using HappyVeggie.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HappyVeggie.Application.AI.Services;

/// <summary>
/// Generates plan content via LLM JSON completion (Doc 04 §5.1).
/// Retry once on malformed JSON as per SRS.
/// </summary>
public sealed class AiPlanGenerationService
{
    private readonly ILlmProvider _llm;
    private readonly FarmContextBuilder _contextBuilder;
    private readonly LlmUsageLogger _usageLogger;
    private readonly LlmProviderOptions _options;
    private readonly ILogger<AiPlanGenerationService> _logger;

    public AiPlanGenerationService(
        ILlmProvider llm,
        FarmContextBuilder contextBuilder,
        LlmUsageLogger usageLogger,
        IOptions<LlmProviderOptions> options,
        ILogger<AiPlanGenerationService> logger)
    {
        _llm = llm;
        _contextBuilder = contextBuilder;
        _usageLogger = usageLogger;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<AiPlanResult> GenerateAsync(Guid farmId, string language, CancellationToken cancellationToken)
    {
        var context = await _contextBuilder.BuildAsync(farmId, cancellationToken);
        var contextText = FarmContextBuilder.ToPromptText(context);

        var messages = new List<LlmMessage>
        {
            new("system", PromptTemplates.PlanGenerationSystem(language)),
            new("user", $"Farm context:\n{contextText}\n\nGenerate a comprehensive farm plan as JSON matching the plan schema. Include all relevant sections based on available data.")
        };

        var options = new LlmOptions
        {
            Model = _options.Model,
            MaxTokens = _options.MaxTokensPlan,
            Temperature = 0.4m,
            Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds),
            RequestType = "plan_generation"
        };

        // First attempt
        var response = await _llm.CompleteJsonAsync(PlanJsonSchema.Schema, messages, options, cancellationToken);
        _usageLogger.LogJsonUsage("plan_generation", response);

        var validation = PlanJsonSchema.Validate(response.RawJson);
        if (validation.IsValid)
        {
            return new AiPlanResult(response.RawJson, true, null, contextText);
        }

        // Retry once (SRS requirement)
        _logger.LogWarning("Plan JSON invalid on first attempt: {Error}. Retrying...", validation.Error);

        messages.Add(new("assistant", response.RawJson));
        messages.Add(new("user", $"Your JSON was malformed: {validation.Error}. Please regenerate valid JSON matching the schema."));

        var retryResponse = await _llm.CompleteJsonAsync(PlanJsonSchema.Schema, messages, options, cancellationToken);
        _usageLogger.LogJsonUsage("plan_generation_retry", retryResponse);

        var retryValidation = PlanJsonSchema.Validate(retryResponse.RawJson);
        if (retryValidation.IsValid)
        {
            return new AiPlanResult(retryResponse.RawJson, true, null, contextText);
        }

        _logger.LogError("Plan JSON invalid after retry: {Error}", retryValidation.Error);
        return new AiPlanResult(retryResponse.RawJson, false, retryValidation.Error, contextText);
    }
}

public sealed record AiPlanResult(string ContentJson, bool IsValid, string? Error, string ContextUsed);
