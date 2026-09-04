namespace HappyVeggie.Domain.Entities;

public sealed class CropCycle
{
    public Guid Id { get; set; }

    public Guid CropZoneId { get; set; }

    public string Season { get; set; } = string.Empty;

    public decimal? PredictedYield { get; set; }

    public string? PredictedYieldUnit { get; set; }

    public decimal? ActualYield { get; set; }

    public string? ActualYieldUnit { get; set; }

    /// <summary>
    /// ActualYield − PredictedYield when both present. Never mutates PredictedYield.
    /// </summary>
    public decimal? Delta { get; set; }

    public string? Notes { get; set; }

    public DateTimeOffset? EndedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public CropZone CropZone { get; set; } = null!;
}
