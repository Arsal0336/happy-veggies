using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.DigitalTwin.Dtos;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.DigitalTwin.Services;

public sealed class DigitalTwinAssembler
{
    private readonly IApplicationDbContext _db;

    public DigitalTwinAssembler(IApplicationDbContext db)
    {
        _db = db;
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

        var waterSources = await _db.WaterSources
            .AsNoTracking()
            .Where(w => w.FarmId == farmId && !w.IsDeleted)
            .Select(w => new WaterSourceBriefDto(w.Id, w.Type, w.IrrigationMethod))
            .ToListAsync(cancellationToken);

        var soilCount = await _db.SoilProfiles
            .AsNoTracking()
            .CountAsync(s => s.FarmId == farmId && !s.IsDeleted, cancellationToken);

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

        // Weather/soil statuses come from TwinSnapshot after RefreshTwin (GAP-020).
        // Water/soil summaries come from live WaterSources / SoilProfiles rows (GAP-024).
        var weather = twinSnapshot is not null
            ? new WeatherSummaryDto(twinSnapshot.WeatherProviderStatus)
            : null;

        var water = new WaterSummaryDto(waterSources.Count, waterSources);
        var soil = new SoilSummaryDto(soilCount);

        // GreenSummaryDto is a placeholder until green scoring is wired into the twin DTO (TASK-120).
        GreenSummaryDto? green = null;

        return new FarmTwinDto(
            farmDto, areas, zones, edges,
            weather, water, soil,
            green,
            latestPlan,
            LayoutMode: "auto",
            TwinRefreshedAt: twinSnapshot?.RefreshedAt);
    }
}
