namespace HappyVeggie.Application.Common.Interfaces;

/// <summary>
/// Persists LLM usage rows for admin analytics (GAP-030). Fire-and-forget safe.
/// </summary>
public interface ILlmUsageRecorder
{
    Task RecordAsync(
        string purpose,
        string model,
        int promptTokens,
        int completionTokens,
        decimal estimatedCostUsd,
        Guid? farmId = null,
        CancellationToken cancellationToken = default);
}
