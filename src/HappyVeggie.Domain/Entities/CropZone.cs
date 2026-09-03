using HappyVeggie.Domain.Enums;

namespace HappyVeggie.Domain.Entities;

public sealed class CropZone
{
    public Guid Id { get; set; }

    // Denormalized for faster farm-scoped reads.
    public Guid FarmId { get; set; }

    public Guid ProductionAreaId { get; set; }

    public string? Label { get; set; }

    // As-entered.
    public decimal AreaInputValue { get; set; }
    public string AreaInputUnit { get; set; } = string.Empty;

    // Canonical comparable measure for aggregation/display (see C-008 in SRS).
    public decimal AreaCanonicalValue { get; set; }

    // Catalog-backed values (TASK-025 will introduce FKs); stored as stable codes/ids for now.
    public string? CropId { get; set; }
    public string? CropFreetext { get; set; }

    public string? SeedVarietyId { get; set; }

    public DateOnly? PlantingDate { get; set; }

    public string? GrowthStage { get; set; }

    public decimal? ExpectedYieldValue { get; set; }
    public string? ExpectedYieldUnit { get; set; }
    public DataProvenance? ExpectedYieldProvenance { get; set; }

    public bool IsExperimental { get; set; }

    public bool IsDeleted { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Farm Farm { get; set; } = null!;
    public ProductionArea ProductionArea { get; set; } = null!;
}

