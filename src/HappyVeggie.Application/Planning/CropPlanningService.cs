using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Compatibility;
using HappyVeggie.Application.DigitalTwin.Services;
using HappyVeggie.Application.Yield;
using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace HappyVeggie.Application.Planning;

/// <summary>
/// Orchestrates plan generation: assembles farm context, compatibility checks,
/// yield estimates, and packages into a FarmPlan.
/// AI-generated plan content (TASK-104) will be wired in later.
/// </summary>
public sealed class CropPlanningService
{
    private readonly IApplicationDbContext _db;
    private readonly DigitalTwinAssembler _twinAssembler;
    private readonly CompatibilityService _compatibility;
    private readonly YieldEstimationService _yieldEstimation;

    public CropPlanningService(
        IApplicationDbContext db,
        DigitalTwinAssembler twinAssembler,
        CompatibilityService compatibility,
        YieldEstimationService yieldEstimation)
    {
        _db = db;
        _twinAssembler = twinAssembler;
        _compatibility = compatibility;
        _yieldEstimation = yieldEstimation;
    }

    public async Task<FarmPlan> GeneratePlanAsync(
        Guid farmId,
        Guid farmerId,
        string language,
        CancellationToken cancellationToken)
    {
        // 1. Assemble twin for context
        var twin = await _twinAssembler.AssembleAsync(farmId, cancellationToken);

        // 2. Check neighbour compatibility warnings
        var warnings = await _compatibility.CheckNeighboursAsync(farmId, cancellationToken);

        // 3. Yield estimates per zone
        var yieldEstimates = new List<YieldEstimate>();
        foreach (var zone in twin.Zones)
        {
            if (zone.CropId is null) continue;
            var estimate = await _yieldEstimation.EstimateAsync(
                zone.CropId, zone.SeedVarietyId, zone.AreaCanonicalValue, cancellationToken);
            if (estimate is not null)
                yieldEstimates.Add(estimate);
        }

        // 4. Get latest version number
        var latestVersion = await _db.FarmPlans
            .Where(p => p.FarmId == farmId)
            .MaxAsync(p => (int?)p.Version, cancellationToken) ?? 0;

        // 5. Build plan content (deterministic sections; AI content to be added via TASK-104)
        var contentSections = new
        {
            farmSummary = new
            {
                name = twin.Farm.Name,
                region = twin.Farm.RegionLabel,
                totalAcres = twin.Farm.AreaAcres,
                areaCount = twin.Areas.Count,
                zoneCount = twin.Zones.Count
            },
            compatibilityWarnings = warnings,
            yieldEstimates,
            waterSources = twin.WaterSummary?.SourceCount ?? 0,
            soilProfiles = twin.SoilSummary?.ProfileCount ?? 0,
            generatedAt = DateTimeOffset.UtcNow
        };

        var contextUsed = new
        {
            twinRefreshedAt = twin.TwinRefreshedAt,
            weatherStatus = twin.Weather?.ProviderStatus,
            zoneCount = twin.Zones.Count,
            edgeCount = twin.NeighbourEdges.Count
        };

        var now = DateTimeOffset.UtcNow;
        var plan = new FarmPlan
        {
            Id = Guid.NewGuid(),
            FarmId = farmId,
            FarmerId = farmerId,
            Language = language,
            ContentJson = JsonSerializer.Serialize(contentSections),
            ContextUsedJson = JsonSerializer.Serialize(contextUsed),
            Version = latestVersion + 1,
            CreatedAt = now
        };

        _db.FarmPlans.Add(plan);
        await _db.SaveChangesAsync(cancellationToken);

        return plan;
    }
}
