using HappyVeggie.Application.AI.Options;
using HappyVeggie.Application.AI.Prompts;
using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.GreenScore;
using Microsoft.Extensions.Options;

namespace HappyVeggie.Application.AI.Services;

/// <summary>
/// Generates natural language green tips after deterministic score (TASK-123 / FR-131).
/// </summary>
public sealed class GreenTipService
{
    private readonly ILlmProvider _llm;
    private readonly GreenFarmScoringService _greenScore;
    private readonly LlmUsageLogger _usageLogger;
    private readonly LlmProviderOptions _options;

    public GreenTipService(
        ILlmProvider llm,
        GreenFarmScoringService greenScore,
        LlmUsageLogger usageLogger,
        IOptions<LlmProviderOptions> options)
    {
        _llm = llm;
        _greenScore = greenScore;
        _usageLogger = usageLogger;
        _options = options.Value;
    }

    public async Task<GreenTipResult> GenerateTipsAsync(Guid farmId, string language, CancellationToken cancellationToken)
    {
        var score = await _greenScore.CalculateAsync(farmId, cancellationToken);

        var factorsText = string.Join("\n", score.Explanations.Select(e => $"- {e}"));

        var messages = new List<LlmMessage>
        {
            new("system", PromptTemplates.GreenTipSystem(language)),
            new("user", $"Green Farm Score: {score.Score}/{score.MaxScore}\n\nFactors:\n{factorsText}\n\nGenerate 2-3 short actionable tips based on these factors.")
        };

        var opts = new LlmOptions
        {
            Model = _options.Model,
            MaxTokens = 300,
            Temperature = 0.6m,
            Timeout = TimeSpan.FromSeconds(15),
            RequestType = "green_tips"
        };

        var response = await _llm.CompleteChatAsync(messages, opts, cancellationToken);
        _usageLogger.LogChatUsage("green_tips", response);

        return new GreenTipResult(score.Score, score.MaxScore, response.Content, score.Explanations);
    }
}

public sealed record GreenTipResult(
    int Score,
    int MaxScore,
    string Tips,
    IReadOnlyList<string> Factors);
