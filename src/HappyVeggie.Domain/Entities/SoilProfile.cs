using HappyVeggie.Domain.Enums;

namespace HappyVeggie.Domain.Entities;

public sealed class SoilProfile
{
    public Guid Id { get; set; }

    public Guid FarmId { get; set; }

    // Optional attachment: if set, soil is specific to that production area; otherwise it's farm-level soil.
    public Guid? ProductionAreaId { get; set; }

    // Soil attributes (all optional; provenance indicates source).
    public string? SoilType { get; set; }
    public DataProvenance? SoilTypeProvenance { get; set; }

    public string? Texture { get; set; }
    public DataProvenance? TextureProvenance { get; set; }

    public decimal? PhValue { get; set; }
    public DataProvenance? PhValueProvenance { get; set; }

    public decimal? OrganicMatterValue { get; set; }
    public DataProvenance? OrganicMatterProvenance { get; set; }

    public decimal? NitrogenValue { get; set; }
    public DataProvenance? NitrogenProvenance { get; set; }

    public decimal? PhosphorusValue { get; set; }
    public DataProvenance? PhosphorusProvenance { get; set; }

    public decimal? PotassiumValue { get; set; }
    public DataProvenance? PotassiumProvenance { get; set; }

    public string? FarmerNotes { get; set; }

    public bool IsDeleted { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Farm Farm { get; set; } = null!;
    public ProductionArea? ProductionArea { get; set; }
}

