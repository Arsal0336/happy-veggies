namespace HappyVeggie.Domain.Entities;

/// <summary>
/// Persisted LLM token/cost usage for admin analytics (FR-041 / NFR-007 / GAP-030).
/// </summary>
public sealed class LlmUsageLog
{
    public Guid Id { get; set; }

    public string RequestType { get; set; } = string.Empty;

    public string? Model { get; set; }

    public int PromptTokens { get; set; }

    public int CompletionTokens { get; set; }

    public decimal EstimatedCostUsd { get; set; }

    public Guid? FarmId { get; set; }

    public Guid? FarmerId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}
