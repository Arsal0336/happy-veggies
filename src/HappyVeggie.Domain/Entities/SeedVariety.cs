namespace HappyVeggie.Domain.Entities;

public enum SeedVarietyType
{
    Hybrid = 0,
    OpenPollinated = 1,
    Local = 2,
    Other = 3
}

public enum RiskBand
{
    Low = 0,
    Medium = 1,
    High = 2,
    Unknown = 3
}

public sealed class SeedVariety
{
    public string Id { get; set; } = string.Empty;

    public string CropId { get; set; } = string.Empty;

    public string NameEn { get; set; } = string.Empty;

    public string NameUr { get; set; } = string.Empty;

    public SeedVarietyType VarietyType { get; set; }

    public bool Enabled { get; set; } = true;

    public int? MaturityDays { get; set; }

    public RiskBand? RiskBand { get; set; }

    public string? SoilNotes { get; set; }
    public string? WaterNotes { get; set; }
    public string? DiseaseResistanceNotes { get; set; }

    public Crop Crop { get; set; } = null!;
}

