using HappyVeggie.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.GreenScore;

/// <summary>
/// Deterministic green farm score based on data availability.
/// Weights TBD — currently a simple availability-based scoring.
/// </summary>
public sealed class GreenFarmScoringService
{
    private readonly IApplicationDbContext _db;

    public GreenFarmScoringService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<GreenScoreResult> CalculateAsync(Guid farmId, CancellationToken cancellationToken)
    {
        var score = 0;
        var maxScore = 100;
        var explanations = new List<string>();

        // 1. Has production areas (20 pts)
        var areaCount = await _db.ProductionAreas.CountAsync(a => a.FarmId == farmId && !a.IsDeleted, cancellationToken);
        if (areaCount > 0) { score += 20; explanations.Add("Production areas configured"); }
        else explanations.Add("No production areas");

        // 2. Has crop zones (20 pts)
        var zoneCount = await _db.CropZones.CountAsync(z => z.FarmId == farmId && !z.IsDeleted, cancellationToken);
        if (zoneCount > 0) { score += 20; explanations.Add("Crop zones defined"); }
        else explanations.Add("No crop zones");

        // 3. Has water data (15 pts)
        var waterCount = await _db.WaterSources.CountAsync(w => w.FarmId == farmId && !w.IsDeleted, cancellationToken);
        if (waterCount > 0) { score += 15; explanations.Add("Water sources documented"); }
        else explanations.Add("No water data");

        // 4. Has soil data (15 pts)
        var soilCount = await _db.SoilProfiles.CountAsync(s => s.FarmId == farmId && !s.IsDeleted, cancellationToken);
        if (soilCount > 0) { score += 15; explanations.Add("Soil profile available"); }
        else explanations.Add("No soil data");

        // 5. Has twin snapshot (15 pts)
        var hasTwin = await _db.TwinSnapshots.AnyAsync(t => t.FarmId == farmId, cancellationToken);
        if (hasTwin) { score += 15; explanations.Add("Digital twin refreshed"); }
        else explanations.Add("Twin not refreshed");

        // 6. Has plans (15 pts)
        var planCount = await _db.FarmPlans.CountAsync(p => p.FarmId == farmId, cancellationToken);
        if (planCount > 0) { score += 15; explanations.Add("Plan generated"); }
        else explanations.Add("No plans generated");

        return new GreenScoreResult(score, maxScore, explanations, DateTimeOffset.UtcNow);
    }
}

public sealed record GreenScoreResult(
    int Score,
    int MaxScore,
    IReadOnlyList<string> Explanations,
    DateTimeOffset ComputedAt);
