namespace HappyVeggie.Application.DigitalTwin.Dtos;

public sealed record FarmTwinDto(
    FarmSummaryDto Farm,
    IReadOnlyList<ProductionAreaDto> Areas,
    IReadOnlyList<CropZoneDto> Zones,
    IReadOnlyList<NeighbourEdgeDto> NeighbourEdges,
    WeatherSummaryDto? Weather,
    WaterSummaryDto? WaterSummary,
    SoilSummaryDto? SoilSummary,
    GreenSummaryDto? GreenSummary,
    PlanSummaryDto? LatestPlan,
    string LayoutMode,
    DateTimeOffset? TwinRefreshedAt);

public sealed record FarmSummaryDto(
    Guid Id,
    string? Name,
    decimal Lat,
    decimal Lng,
    string RegionCode,
    string RegionLabel,
    decimal AreaAcres,
    decimal AreaInputValue,
    string AreaInputUnit,
    bool IsNewFarmSetup);

public sealed record ProductionAreaDto(
    Guid Id,
    string TypeCode,
    string? Name,
    decimal AreaInputValue,
    string AreaInputUnit,
    decimal AreaCanonicalValue,
    string? TemperatureC,
    string? HumidityPercent,
    string? Ventilation,
    string? GrowingMedium,
    string? StructureType);

public sealed record CropZoneDto(
    Guid Id,
    Guid ProductionAreaId,
    string? Label,
    decimal AreaInputValue,
    string AreaInputUnit,
    decimal AreaCanonicalValue,
    string? CropId,
    string? CropFreetext,
    string? SeedVarietyId,
    DateOnly? PlantingDate,
    string? GrowthStage,
    decimal? ExpectedYieldValue,
    string? ExpectedYieldUnit,
    string? ExpectedYieldProvenance,
    bool IsExperimental);

public sealed record NeighbourEdgeDto(
    Guid Id,
    Guid CropZoneAId,
    Guid CropZoneBId,
    string AdjacencyType);

public sealed record WeatherSummaryDto(
    string? ProviderStatus,
    decimal? TemperatureC = null,
    decimal? HumidityPercent = null,
    decimal? WindSpeedKmh = null,
    decimal? RainfallMm = null,
    string? Condition = null,
    string? ForecastTrend = null,
    DateTimeOffset? ObservedAt = null);

public sealed record WaterSummaryDto(
    int SourceCount,
    IReadOnlyList<WaterSourceBriefDto> Sources,
    string? Reliability = null,
    string? IrrigationMethod = null);

public sealed record WaterSourceBriefDto(
    Guid Id,
    string Type,
    string? IrrigationMethod);

public sealed record SoilSummaryDto(
    int ProfileCount,
    string? ProviderStatus = null,
    string? SoilType = null,
    string? Texture = null,
    decimal? PhLevel = null,
    decimal? OrganicMatterPercent = null);

public sealed record GreenSummaryDto(
    int OverallScore,
    int MaxScore,
    string NonCertificationDisclaimer,
    string? WeightsNote,
    DateTimeOffset ComputedAt,
    IReadOnlyList<GreenFactorSummaryDto> Factors);

public sealed record GreenFactorSummaryDto(
    string Key,
    string Label,
    bool Available,
    int Points,
    int MaxPoints,
    string Explanation,
    string DataQuality);

public sealed record PlanSummaryDto(
    Guid Id,
    int Version,
    string Language,
    DateTimeOffset CreatedAt);
