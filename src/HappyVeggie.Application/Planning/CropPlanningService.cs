using HappyVeggie.Application.AI.Context;
using HappyVeggie.Application.AI.Services;
using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Compatibility;
using HappyVeggie.Application.DigitalTwin.Services;
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
    private readonly FarmContextBuilder _contextBuilder;
    private readonly AiPlanGenerationService _aiPlan;
    private readonly ILogger<CropPlanningService> _logger;

    public CropPlanningService(
        IApplicationDbContext db,
        DigitalTwinAssembler twinAssembler,
        CompatibilityService compatibility,
        YieldEstimationService yieldEstimation,
        FarmContextBuilder contextBuilder,
        AiPlanGenerationService aiPlan,
        ILogger<CropPlanningService> logger)
    {
        _db = db;
        _twinAssembler = twinAssembler;
        _compatibility = compatibility;
        _yieldEstimation = yieldEstimation;
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

        var yieldEstimates = new List<object>();
        foreach (var zone in twin.Zones)
        {
            if (zone.CropId is null) continue;
            var estimate = await _yieldEstimation.EstimateAsync(
                zone.CropId, zone.SeedVarietyId, zone.AreaCanonicalValue, cancellationToken);
            if (estimate is not null)
                yieldEstimates.Add(estimate);
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

        // Keep AI planSections structured; append deterministic metadata
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
            zoneCount = twin.Zones.Count
        });
        root["compatibilityWarnings"] = JsonSerializer.SerializeToNode(warnings);
        root["yieldEstimates"] = JsonSerializer.SerializeToNode(yieldEstimates);

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
                z.GrowthStage
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
