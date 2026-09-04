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
    public IReadOnlyList<ZoneEconomicsContext> ZoneEconomics { get; init; } = [];
    public GreenScoreContext? GreenScore { get; init; }
    public IReadOnlyList<string> CompatibilityWarnings { get; init; } = [];
    public IReadOnlyList<string> NeighbourEdges { get; init; } = [];
    public IReadOnlyList<AlertContext> Alerts { get; init; } = [];
    public IReadOnlyList<CropCycleContext> CropCycles { get; init; } = [];
    public IReadOnlyList<string> NearbyAggregates { get; init; } = [];
    public IReadOnlyList<string> MissingDataFlags { get; init; } = [];
    public DateTimeOffset? TwinRefreshedAt { get; init; }
}

public sealed record FarmIdentityContext(
    string Name,
    string? Region,
    string? RegionCode,
    decimal? Lat,
    decimal? Lng,
    decimal? TotalAreaAcres,
    string? SoilTypeOnFarm,
    bool? WaterAccess,
    string? WaterSourceLabel,
    string Language);

public sealed record AreaContext(
    string Name,
    string TypeCode,
    string TypeLabel,
    decimal? AreaValue,
    string? AreaUnit,
    decimal? AreaCanonicalAcres,
    decimal? TemperatureC,
    decimal? HumidityPercent,
    string? StructureType,
    string? GrowingMedium,
    string? Provenance);

public sealed record ZoneContext(
    string Label,
    string? CropId,
    string? CropName,
    string? VarietyName,
    string? GrowthStage,
    string? PlantingDate,
    int? DaysSincePlanting,
    decimal? AreaValue,
    string? AreaUnit,
    decimal? AreaCanonicalAcres,
    decimal? ExpectedYield,
    string? YieldUnit,
    string? YieldProvenance,
    string ProductionAreaType,
    bool IsExperimental);

public sealed record WeatherContext(
    decimal? TempC,
    decimal? Humidity,
    decimal? WindKmh,
    decimal? RainfallMm,
    string? Condition,
    string? Provider,
    DateTimeOffset? ObservedAt);

public sealed record SoilContext(
    string? SoilType,
    string? Texture,
    decimal? Ph,
    decimal? OrganicMatter,
    decimal? Nitrogen,
    decimal? Phosphorus,
    decimal? Potassium,
    string? FarmerNotes,
    string? Provenance);

public sealed record WaterContext(
    string? SourceType,
    string? IrrigationMethod,
    decimal? Reliability,
    string? SeasonalAvailability,
    decimal? AvailabilityValue,
    string? AvailabilityUnit,
    bool? IsActive);

public sealed record EconomicsContext(
    int ZonesWithRates,
    decimal? TotalGrossValue,
    string? Currency);

public sealed record ZoneEconomicsContext(
    string ZoneLabel,
    string CropId,
    decimal ExpectedYield,
    string YieldUnit,
    decimal RatePerUnit,
    string RateUnit,
    string Currency,
    decimal ReferenceGrossValue,
    string Period);

public sealed record GreenScoreContext(int Score, int MaxScore, IReadOnlyList<string> Factors);

public sealed record AlertContext(
    string Type,
    string Severity,
    string Title,
    string Body,
    DateTimeOffset CreatedAt);

public sealed record CropCycleContext(
    string ZoneLabel,
    string Season,
    decimal? PredictedYield,
    string? PredictedYieldUnit,
    decimal? ActualYield,
    string? ActualYieldUnit,
    decimal? Delta,
    string? Notes);
