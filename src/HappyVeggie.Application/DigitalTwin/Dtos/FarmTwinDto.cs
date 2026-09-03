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
    string? ProviderStatus);

public sealed record WaterSummaryDto(
    int SourceCount,
    IReadOnlyList<WaterSourceBriefDto> Sources);

public sealed record WaterSourceBriefDto(
    Guid Id,
    string Type,
    string? IrrigationMethod);

public sealed record SoilSummaryDto(
    int ProfileCount);

public sealed record GreenSummaryDto; // placeholder — TASK-120

public sealed record PlanSummaryDto(
    Guid Id,
    int Version,
    string Language,
    DateTimeOffset CreatedAt);
