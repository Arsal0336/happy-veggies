using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace HappyVeggie.Application.AI.Services;

/// <summary>
/// Logs LLM usage for admin cost visibility (NFR-007). No secrets in logs.
/// Implements <see cref="ILlmUsageRecorder"/> for provider-side persistence (GAP-030).
/// </summary>
public sealed class LlmUsageLogger : ILlmUsageRecorder
{
    /// <summary>Rough blended estimate USD per token until vendor pricing TBD.</summary>
    private const decimal UsdPerToken = 0.000002m;

    private readonly ILogger<LlmUsageLogger> _logger;
    private readonly IApplicationDbContext _db;

    public LlmUsageLogger(ILogger<LlmUsageLogger> logger, IApplicationDbContext db)
    {
        _logger = logger;
        _db = db;
    }

    public void LogChatUsage(string requestType, LlmChatResponse response, Guid? farmId = null)
    {
        _logger.LogInformation(
            "LLM Chat | Type={RequestType} Model={Model} PromptTokens={PromptTokens} CompletionTokens={CompletionTokens} Latency={LatencyMs}ms FarmId={FarmId}",
            requestType, response.Model, response.PromptTokens, response.CompletionTokens,
            response.Latency.TotalMilliseconds, farmId);

        var total = response.PromptTokens + response.CompletionTokens;
        Enqueue(
            requestType,
            response.Model,
            response.PromptTokens,
            response.CompletionTokens,
            total * UsdPerToken,
            farmId,
            farmerId: null);
    }

    public void LogJsonUsage(string requestType, LlmJsonResponse response, Guid? farmId = null)
    {
        _logger.LogInformation(
            "LLM JSON | Type={RequestType} Model={Model} PromptTokens={PromptTokens} CompletionTokens={CompletionTokens} Valid={IsValid} Latency={LatencyMs}ms FarmId={FarmId}",
            requestType, response.Model, response.PromptTokens, response.CompletionTokens,
            response.IsValid, response.Latency.TotalMilliseconds, farmId);

        var total = response.PromptTokens + response.CompletionTokens;
        Enqueue(
            requestType,
            response.Model,
            response.PromptTokens,
            response.CompletionTokens,
            total * UsdPerToken,
            farmId,
            farmerId: null);
    }

    public async Task RecordAsync(
        string purpose,
        string model,
        int promptTokens,
        int completionTokens,
        decimal estimatedCostUsd,
        Guid? farmId = null,
        CancellationToken cancellationToken = default)
    {
        Enqueue(purpose, model, promptTokens, completionTokens, estimatedCostUsd, farmId, farmerId: null);
        await _db.SaveChangesAsync(cancellationToken);
    }

    private void Enqueue(
        string requestType,
        string? model,
        int promptTokens,
        int completionTokens,
        decimal estimatedCostUsd,
        Guid? farmId,
        Guid? farmerId)
    {
        _db.LlmUsageLogs.Add(new LlmUsageLog
        {
            Id = Guid.NewGuid(),
            RequestType = requestType,
            Model = model,
            PromptTokens = promptTokens,
            CompletionTokens = completionTokens,
            EstimatedCostUsd = estimatedCostUsd,
            FarmId = farmId,
            FarmerId = farmerId,
            CreatedAt = DateTimeOffset.UtcNow
        });
    }
}
