using HappyVeggie.Domain.Enums;

namespace HappyVeggie.Domain.Entities;

public sealed class ProductionArea
{
    public Guid Id { get; set; }

    public Guid FarmId { get; set; }

    // Stable catalog code (e.g., open_field, shed, greenhouse).
    public string TypeCode { get; set; } = string.Empty;

    public string? Name { get; set; }

    // As-entered.
    public decimal AreaInputValue { get; set; }
    public string AreaInputUnit { get; set; } = string.Empty;

    // Canonical comparable measure for aggregation/display (see C-008 in SRS).
    public decimal AreaCanonicalValue { get; set; }

    // Optional protected environment attributes + provenance (do not fabricate).
    public decimal? TemperatureC { get; set; }
    public DataProvenance? TemperatureProvenance { get; set; }

    public decimal? HumidityPercent { get; set; }
    public DataProvenance? HumidityProvenance { get; set; }

    public string? Ventilation { get; set; }
    public DataProvenance? VentilationProvenance { get; set; }

    public string? GrowingMedium { get; set; }
    public DataProvenance? GrowingMediumProvenance { get; set; }

    public string? StructureType { get; set; }
    public DataProvenance? StructureTypeProvenance { get; set; }

    public bool IsDeleted { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Farm Farm { get; set; } = null!;

    public ProductionAreaType Type { get; set; } = null!;
}

