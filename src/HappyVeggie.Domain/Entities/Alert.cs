namespace HappyVeggie.Domain.Entities;

/// <summary>
/// Persisted farm alert (GAP-050 / FR-037,093–094).
/// Scheduler cadence for evaluation is TBD-10.
/// </summary>
public sealed class Alert
{
    public Guid Id { get; set; }

    public Guid FarmId { get; set; }

    public string Type { get; set; } = string.Empty;

    public string Severity { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Body { get; set; } = string.Empty;

    public bool IsRead { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Dedup / provenance key for the rule that created this alert (e.g. weather_failed, heat_advisory).
    /// </summary>
    public string? SourceSignal { get; set; }

    public Farm Farm { get; set; } = null!;
}
