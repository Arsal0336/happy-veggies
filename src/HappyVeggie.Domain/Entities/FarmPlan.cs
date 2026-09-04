namespace HappyVeggie.Domain.Entities;

public sealed class FarmPlan
{
    public Guid Id { get; set; }

    public Guid FarmId { get; set; }

    public Guid FarmerId { get; set; }

    public string Language { get; set; } = "en";

    // Plan sections as structured JSON (never raw LLM blobs to UI).
    public string ContentJson { get; set; } = string.Empty;

    // What context was used to generate this plan (weather, soil flags, etc.).
    public string? ContextUsedJson { get; set; }

    public int Version { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>True when a reviewer flagged the plan (GAP-041 / FR-040).</summary>
    public bool IsFlagged { get; set; }

    /// <summary>none | approved | flagged | dismissed (TBD-17 interim).</summary>
    public string ReviewStatus { get; set; } = "none";

    public string? ReviewNote { get; set; }

    public DateTimeOffset? ReviewedAt { get; set; }

    public Farm Farm { get; set; } = null!;
    public Farmer Farmer { get; set; } = null!;
}
