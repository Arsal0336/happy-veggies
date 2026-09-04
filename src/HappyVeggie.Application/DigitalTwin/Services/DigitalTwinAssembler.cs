using System.Text.Json;
using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.DigitalTwin.Dtos;
using HappyVeggie.Application.GreenScore;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.DigitalTwin.Services;

public sealed class DigitalTwinAssembler
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly IApplicationDbContext _db;
    private readonly GreenFarmScoringService _greenScore;

    public DigitalTwinAssembler(IApplicationDbContext db, GreenFarmScoringService greenScore)
    {
        _db = db;
        _greenScore = greenScore;
    }

    public async Task<FarmTwinDto> AssembleAsync(Guid farmId, CancellationToken cancellationToken)
    {
        var farm = await _db.Farms
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == farmId && !f.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException($"Farm {farmId} not found.");

        var areaRows = await _db.ProductionAreas
            .AsNoTracking()
            .Where(a => a.FarmId == farmId && !a.IsDeleted)
            .ToListAsync(cancellationToken);

        var areas = areaRows
            .OrderBy(a => a.CreatedAt)
            .Select(a => new ProductionAreaDto(
                a.Id,
                a.TypeCode,
                a.Name,
                a.AreaInputValue,
                a.AreaInputUnit,
                a.AreaCanonicalValue,
                a.TemperatureC != null ? a.TemperatureC.Value.ToString("F1") : null,
                a.HumidityPercent != null ? a.HumidityPercent.Value.ToString("F1") : null,
                a.Ventilation,
                a.GrowingMedium,
                a.StructureType))
            .ToList();

        var zoneRows = await _db.CropZones
            .AsNoTracking()
            .Where(z => z.FarmId == farmId && !z.IsDeleted)
            .ToListAsync(cancellationToken);

        var zones = zoneRows
            .OrderBy(z => z.CreatedAt)
            .Select(z => new CropZoneDto(
                z.Id,
                z.ProductionAreaId,
                z.Label,
                z.AreaInputValue,
                z.AreaInputUnit,
                z.AreaCanonicalValue,
                z.CropId,
                z.CropFreetext,
                z.SeedVarietyId,
                z.PlantingDate,
                z.GrowthStage,
                z.ExpectedYieldValue,
                z.ExpectedYieldUnit,
                z.ExpectedYieldProvenance != null ? z.ExpectedYieldProvenance.Value.ToString() : null,
                z.IsExperimental))
            .ToList();

        var edges = await _db.FieldNeighbourEdges
            .AsNoTracking()
            .Where(e => e.FarmId == farmId && e.Enabled)
            .Select(e => new NeighbourEdgeDto(e.Id, e.CropZoneAId, e.CropZoneBId, e.AdjacencyType))
            .ToListAsync(cancellationToken);

        var twinSnapshot = await _db.TwinSnapshots
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.FarmId == farmId, cancellationToken);

        var waterRows = await _db.WaterSources
            .AsNoTracking()
            .Where(w => w.FarmId == farmId && !w.IsDeleted)
            .ToListAsync(cancellationToken);

        var waterSources = waterRows
            .Select(w => new WaterSourceBriefDto(w.Id, w.Type, w.IrrigationMethod))
            .ToList();

        var primaryWater = waterRows.FirstOrDefault();
        var reliability = primaryWater?.ReliabilityValue is { } r
            ? r >= 0.75m ? "reliable" : r >= 0.4m ? "moderate" : "limited"
            : primaryWater?.SeasonalAvailability;

        var soilProfiles = await _db.SoilProfiles
            .AsNoTracking()
            .Where(s => s.FarmId == farmId && !s.IsDeleted)
            .ToListAsync(cancellationToken);

        var planRows = await _db.FarmPlans
            .AsNoTracking()
            .Where(p => p.FarmId == farmId)
            .ToListAsync(cancellationToken);

        var latestPlan = planRows
            .OrderByDescending(p => p.Version)
            .Select(p => new PlanSummaryDto(p.Id, p.Version, p.Language, p.CreatedAt))
            .FirstOrDefault();

        var farmDto = new FarmSummaryDto(
            farm.Id, farm.Name, farm.Lat, farm.Lng,
            farm.RegionCode, farm.RegionLabel,
            farm.AreaAcres, farm.AreaInputValue, farm.AreaInputUnit,
            farm.IsNewFarmSetup);

        var twinPayload = ParseTwinJson(twinSnapshot?.TwinJson);

        var weather = twinSnapshot is null
            ? null
            : new WeatherSummaryDto(
                twinSnapshot.WeatherProviderStatus,
                twinPayload?.Weather?.TemperatureC,
                twinPayload?.Weather?.HumidityPercent,
                twinPayload?.Weather?.WindSpeedKmh,
                twinPayload?.Weather?.RainfallMm,
                twinPayload?.Weather?.Condition,
                twinPayload?.Weather?.Condition ?? twinSnapshot.WeatherProviderStatus,
                twinPayload?.Weather?.ObservedAt);

        var water = new WaterSummaryDto(
            waterSources.Count,
            waterSources,
            reliability,
            primaryWater?.IrrigationMethod);

        var primarySoil = soilProfiles.FirstOrDefault();
        var soil = new SoilSummaryDto(
            soilProfiles.Count,
            twinSnapshot?.SoilProviderStatus,
            twinPayload?.Soil?.SoilType ?? primarySoil?.SoilType,
            twinPayload?.Soil?.Texture ?? primarySoil?.Texture,
            twinPayload?.Soil?.PhLevel ?? primarySoil?.PhValue,
            twinPayload?.Soil?.OrganicMatterPercent ?? primarySoil?.OrganicMatterValue);

        var greenResult = await _greenScore.CalculateAsync(farmId, cancellationToken);
        var green = new GreenSummaryDto(
            greenResult.Score,
            greenResult.MaxScore,
            greenResult.NonCertificationDisclaimer,
            greenResult.WeightsNote,
            greenResult.ComputedAt,
            greenResult.Factors.Select(f => new GreenFactorSummaryDto(
                f.Key,
                f.Label,
                f.Available,
                f.Points,
                f.MaxPoints,
                f.Explanation,
                f.DataQuality)).ToList());

        return new FarmTwinDto(
            farmDto, areas, zones, edges,
            weather, water, soil,
            green,
            latestPlan,
            LayoutMode: "auto",
            TwinRefreshedAt: twinSnapshot?.RefreshedAt);
    }

    private static TwinJsonPayload? ParseTwinJson(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<TwinJsonPayload>(json, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private sealed class TwinJsonPayload
    {
        public TwinWeatherPayload? Weather { get; set; }
        public TwinSoilPayload? Soil { get; set; }
    }

    private sealed class TwinWeatherPayload
    {
        public string? Status { get; set; }
        public decimal? TemperatureC { get; set; }
        public decimal? HumidityPercent { get; set; }
        public decimal? WindSpeedKmh { get; set; }
        public decimal? RainfallMm { get; set; }
        public string? Condition { get; set; }
        public DateTimeOffset? ObservedAt { get; set; }
    }

    private sealed class TwinSoilPayload
    {
        public string? Status { get; set; }
        public string? SoilType { get; set; }
        public string? Texture { get; set; }
        public decimal? PhLevel { get; set; }
        public decimal? OrganicMatterPercent { get; set; }
    }
}
