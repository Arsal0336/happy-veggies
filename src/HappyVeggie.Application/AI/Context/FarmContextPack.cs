namespace HappyVeggie.Application.AI.Context;

/// <summary>
/// Structured farm context for LLM grounding (Doc 04 §3.2).
/// Assembled from DigitalTwin + related data.
/// </summary>
public sealed record FarmContextPack
{
    public FarmIdentityContext Farm { get; init; } = null!;
    public IReadOnlyList<AreaContext> ProductionAreas { get; init; } = [];
    public IReadOnlyList<ZoneContext> CropZones { get; init; } = [];
    public WeatherContext? Weather { get; init; }
    public SoilContext? Soil { get; init; }
    public IReadOnlyList<WaterContext> WaterSources { get; init; } = [];
    public EconomicsContext? Economics { get; init; }
    public GreenScoreContext? GreenScore { get; init; }
    public IReadOnlyList<string> CompatibilityWarnings { get; init; } = [];
    public IReadOnlyList<string> NearbyAggregates { get; init; } = [];
    public IReadOnlyList<string> MissingDataFlags { get; init; } = [];
}

public sealed record FarmIdentityContext(
    string Name, string? Region, decimal? Lat, decimal? Lng,
    decimal? TotalAreaAcres, string Language);

public sealed record AreaContext(
    string Name, string TypeCode, string TypeLabel,
    decimal? AreaValue, string? AreaUnit, string? Provenance);

public sealed record ZoneContext(
    string Label, string? CropName, string? VarietyName,
    string? GrowthStage, string? PlantingDate,
    decimal? ExpectedYield, string? YieldUnit,
    string ProductionAreaType, bool IsExperimental);

public sealed record WeatherContext(
    decimal? TempC, decimal? Humidity, decimal? WindKmh,
    decimal? RainfallMm, string? Condition, string? Provider,
    DateTimeOffset? ObservedAt);

public sealed record SoilContext(
    string? SoilType, string? Texture, decimal? Ph,
    decimal? OrganicMatter, string? Provenance);

public sealed record WaterContext(
    string? SourceType, string? Name, bool? IsActive);

public sealed record EconomicsContext(
    int ZonesWithRates, decimal? TotalGrossValue, string? Currency);

public sealed record GreenScoreContext(int Score, int MaxScore, IReadOnlyList<string> Factors);
