using HappyVeggie.Application.AI.Context;
using HappyVeggie.Application.AI.Services;
using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Compatibility;
using HappyVeggie.Application.DigitalTwin.Services;
using HappyVeggie.Application.Economics;
using HappyVeggie.Application.Yield;
using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace HappyVeggie.Application.Planning;

/// <summary>
/// Orchestrates plan generation: grounded farm context + LLM structured sections (GAP-031).
/// On LLM failure throws without persisting a corrupt plan.
/// </summary>
public sealed class CropPlanningService
{
    private readonly IApplicationDbContext _db;
    private readonly DigitalTwinAssembler _twinAssembler;
    private readonly CompatibilityService _compatibility;
    private readonly YieldEstimationService _yieldEstimation;
    private readonly EconomicsService _economics;
    private readonly FarmContextBuilder _contextBuilder;
    private readonly AiPlanGenerationService _aiPlan;
    private readonly ILogger<CropPlanningService> _logger;

    public CropPlanningService(
        IApplicationDbContext db,
        DigitalTwinAssembler twinAssembler,
        CompatibilityService compatibility,
        YieldEstimationService yieldEstimation,
        EconomicsService economics,
        FarmContextBuilder contextBuilder,
        AiPlanGenerationService aiPlan,
        ILogger<CropPlanningService> logger)
    {
        _db = db;
        _twinAssembler = twinAssembler;
        _compatibility = compatibility;
        _yieldEstimation = yieldEstimation;
        _economics = economics;
        _contextBuilder = contextBuilder;
        _aiPlan = aiPlan;
        _logger = logger;
    }

    public async Task<FarmPlan> GeneratePlanAsync(
        Guid farmId,
        Guid farmerId,
        string language,
        CancellationToken cancellationToken)
    {
        var twin = await _twinAssembler.AssembleAsync(farmId, cancellationToken);
        var contextPack = await _contextBuilder.BuildAsync(farmId, cancellationToken);
        var warnings = await _compatibility.CheckNeighboursAsync(farmId, cancellationToken);

        var yieldRows = new List<object>();
        var economicsRows = new List<object>();

        foreach (var zone in twin.Zones)
        {
            if (zone.CropId is null)
            {
                continue;
            }

            var cropName = zone.CropFreetext ?? zone.CropId;
            var areaAcres = zone.AreaCanonicalValue;
            var zoneYield = zone.ExpectedYieldValue;
            var zoneYieldUnit = zone.ExpectedYieldUnit;

            var estimate = await _yieldEstimation.EstimateAsync(
                zone.CropId, zone.SeedVarietyId, areaAcres, cancellationToken);

            var displayYield = zoneYield ?? estimate?.EstimatedYield;
            var displayUnit = !string.IsNullOrWhiteSpace(zoneYieldUnit)
                ? zoneYieldUnit!
                : estimate?.Unit ?? "kg";
            var confidence = zoneYield is not null
                ? (zone.ExpectedYieldProvenance ?? "stored")
                : estimate?.Confidence ?? "low";

            yieldRows.Add(new
            {
                zoneId = zone.Id,
                zoneLabel = zone.Label ?? "Zone",
                cropId = zone.CropId,
                cropName,
                areaAcres,
                areaUnit = "acres",
                estimatedYield = displayYield,
                unit = displayUnit,
                confidence,
                note = zoneYield is not null
                    ? "Zone expected yield from farm twin"
                    : estimate?.Note
            });

            var econ = await _economics.CalculateForZoneAsync(
                zone.Id,
                cancellationToken,
                displayYield,
                displayUnit);
            economicsRows.Add(new
            {
                zoneId = zone.Id,
                zoneLabel = zone.Label ?? "Zone",
                cropId = zone.CropId,
                cropName,
                areaAcres,
                expectedYield = econ?.ExpectedYield ?? displayYield,
                yieldUnit = econ?.YieldUnit ?? displayUnit,
                ratePerUnit = econ?.RatePerUnit,
                rateUnit = econ?.RateUnit,
                currency = econ?.Currency ?? "PKR",
                yieldInRateUnit = econ?.YieldInRateUnit,
                referenceGrossValue = econ?.ReferenceGrossValue,
                period = econ?.Period,
                sourceLabel = econ?.SourceLabel
            });
        }

        AiPlanResult aiResult;
        try
        {
            aiResult = await _aiPlan.GenerateAsync(farmId, language, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Plan LLM failed for farm {FarmId}; farm left unchanged", farmId);
            throw new InvalidOperationException(
                "Plan generation failed: AI provider error. Your farm data was not changed. Please retry.", ex);
        }

        if (!aiResult.IsValid)
        {
            _logger.LogError("Plan JSON invalid for farm {FarmId}: {Error}", farmId, aiResult.Error);
            throw new InvalidOperationException(
                $"Plan generation failed: {aiResult.Error ?? "invalid plan JSON"}. Your farm data was not changed.");
        }

        var root = JsonNode.Parse(aiResult.ContentJson)?.AsObject()
            ?? throw new InvalidOperationException(
                "Plan generation failed: empty plan JSON. Your farm data was not changed.");

        root["language"] = language;
        root["farmSummary"] = JsonSerializer.SerializeToNode(new
        {
            name = twin.Farm.Name,
            region = twin.Farm.RegionLabel,
            totalAcres = twin.Farm.AreaAcres,
            areaCount = twin.Areas.Count,
            zoneCount = twin.Zones.Count,
            lat = twin.Farm.Lat,
            lng = twin.Farm.Lng
        });
        root["farmStatus"] = JsonSerializer.SerializeToNode(new
        {
            weatherTempC = twin.Weather?.TemperatureC,
            weatherCondition = twin.Weather?.Condition ?? twin.Weather?.ForecastTrend,
            rainfallMm = twin.Weather?.RainfallMm,
            humidityPercent = twin.Weather?.HumidityPercent,
            waterSourceCount = twin.WaterSummary?.SourceCount ?? 0,
            irrigationMethod = twin.WaterSummary?.IrrigationMethod,
            waterReliability = twin.WaterSummary?.Reliability,
            soilType = twin.SoilSummary?.SoilType ?? contextPack.Soil?.SoilType,
            soilPh = twin.SoilSummary?.PhLevel ?? contextPack.Soil?.Ph,
            twinRefreshedAt = twin.TwinRefreshedAt
        });
        root["compatibilityWarnings"] = JsonSerializer.SerializeToNode(
            warnings.Select(w => new
            {
                zoneA = w.ZoneALabel,
                zoneB = w.ZoneBLabel,
                reason = w.Reason
            }));
        root["yieldEstimates"] = JsonSerializer.SerializeToNode(yieldRows);
        root["economicsRows"] = JsonSerializer.SerializeToNode(economicsRows);

        var contextUsed = new
        {
            language,
            twinRefreshedAt = twin.TwinRefreshedAt,
            weatherStatus = twin.Weather?.ProviderStatus,
            areas = twin.Areas.Select(a => new { a.Id, a.TypeCode, a.Name, a.AreaCanonicalValue }),
            zones = twin.Zones.Select(z => new
            {
                z.Id,
                z.ProductionAreaId,
                z.Label,
                z.CropId,
                z.SeedVarietyId,
                z.GrowthStage,
                z.ExpectedYieldValue,
                z.ExpectedYieldUnit
            }),
            soilProfiles = new
            {
                count = twin.SoilSummary?.ProfileCount ?? 0,
                summary = contextPack.Soil is null
                    ? null
                    : new
                    {
                        contextPack.Soil.SoilType,
                        contextPack.Soil.Texture,
                        contextPack.Soil.Ph,
                        contextPack.Soil.OrganicMatter,
                        contextPack.Soil.Provenance
                    }
            },
            waterSources = new
            {
                count = twin.WaterSummary?.SourceCount ?? 0,
                types = twin.WaterSummary?.Sources.Select(s => s.Type).ToList() ?? []
            },
            edgeCount = twin.NeighbourEdges.Count,
            missingData = contextPack.MissingDataFlags
        };

        var latestVersion = await _db.FarmPlans
            .Where(p => p.FarmId == farmId)
            .MaxAsync(p => (int?)p.Version, cancellationToken) ?? 0;

        var now = DateTimeOffset.UtcNow;
        var plan = new FarmPlan
        {
            Id = Guid.NewGuid(),
            FarmId = farmId,
            FarmerId = farmerId,
            Language = language,
            ContentJson = root.ToJsonString(),
            ContextUsedJson = JsonSerializer.Serialize(contextUsed),
            Version = latestVersion + 1,
            CreatedAt = now
        };

        _db.FarmPlans.Add(plan);
        await _db.SaveChangesAsync(cancellationToken);

        return plan;
    }
}
