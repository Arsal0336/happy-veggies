using HappyVeggie.Domain.Enums;

namespace HappyVeggie.Domain.Entities;

public sealed class WaterSource
{
    public Guid Id { get; set; }

    public Guid FarmId { get; set; }

    // e.g., tube_well, canal, rainwater, reservoir, other
    public string Type { get; set; } = string.Empty;

    // Optional quantitative availability (unit depends on UI/config).
    public decimal? AvailabilityValue { get; set; }
    public string? AvailabilityUnit { get; set; }
    public DataProvenance? AvailabilityProvenance { get; set; }

    // Optional seasonal availability label (e.g., "limited in summer").
    public string? SeasonalAvailability { get; set; }
    public DataProvenance? SeasonalAvailabilityProvenance { get; set; }

    // Optional capacity estimate.
    public decimal? CapacityEstimateValue { get; set; }
    public string? CapacityEstimateUnit { get; set; }
    public DataProvenance? CapacityEstimateProvenance { get; set; }

    // Optional reliability estimate.
    public decimal? ReliabilityValue { get; set; }
    public DataProvenance? ReliabilityProvenance { get; set; }

    // Optional irrigation method and provenance.
    public string? IrrigationMethod { get; set; }
    public DataProvenance? IrrigationMethodProvenance { get; set; }

    // Optional served crop zone ids (stored later as proper relations in TASK-?? if needed).
    public string? ServedCropZoneIdsJson { get; set; }

    public bool IsDeleted { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Farm Farm { get; set; } = null!;
}

