using HappyVeggie.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.GreenScore;

/// <summary>
/// Deterministic green farm score based on data availability (GAP-053 / FR-127–133).
/// Factor weights are TBD-06 (SRS App G) — interim: equal weights across dimensions.
/// </summary>
public sealed class GreenFarmScoringService
{
    public const string NonCertificationDisclaimer =
        "This green score is a guidance indicator only and is not a certification.";

    public const string WeightsNote =
        "TBD-06: factor weights not finalized (SRS App G). Interim equal weights used.";

    private static readonly (string Key, string Label, string UnavailableReason, string AvailableQuality)[] FactorDefs =
    [
        ("production_areas", "Production areas", "No production areas configured", "measured"),
        ("crop_zones", "Crop zones", "No crop zones defined", "measured"),
        ("water", "Water sources", "No water data available", "measured"),
        ("soil", "Soil profile", "No soil data available", "estimated"),
        ("twin", "Digital twin", "Twin not refreshed", "estimated"),
        ("plans", "Crop plans", "No plans generated", "estimated")
    ];

    private readonly IApplicationDbContext _db;

    public GreenFarmScoringService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<GreenScoreResult> CalculateAsync(Guid farmId, CancellationToken cancellationToken)
    {
        var areaCount = await _db.ProductionAreas.CountAsync(a => a.FarmId == farmId && !a.IsDeleted, cancellationToken);
        var zoneCount = await _db.CropZones.CountAsync(z => z.FarmId == farmId && !z.IsDeleted, cancellationToken);
        var waterCount = await _db.WaterSources.CountAsync(w => w.FarmId == farmId && !w.IsDeleted, cancellationToken);
        var soilCount = await _db.SoilProfiles.CountAsync(s => s.FarmId == farmId && !s.IsDeleted, cancellationToken);
        var hasTwin = await _db.TwinSnapshots.AnyAsync(t => t.FarmId == farmId, cancellationToken);
        var planCount = await _db.FarmPlans.CountAsync(p => p.FarmId == farmId, cancellationToken);

        bool[] available =
        [
            areaCount > 0,
            zoneCount > 0,
            waterCount > 0,
            soilCount > 0,
            hasTwin,
            planCount > 0
        ];

        var factorCount = FactorDefs.Length;
        var maxPerFactor = 100 / factorCount; // equal weights interim (TBD-06)
        var remainder = 100 % factorCount;

        var factors = new List<GreenScoreFactor>(factorCount);
        var explanations = new List<string>(factorCount);
        var score = 0;

        for (var i = 0; i < factorCount; i++)
        {
            var def = FactorDefs[i];
            var maxPoints = maxPerFactor + (i < remainder ? 1 : 0);
            var isAvailable = available[i];
            var points = isAvailable ? maxPoints : 0;
            score += points;

            var quality = isAvailable ? def.AvailableQuality : "unavailable";
            var explanation = isAvailable
                ? $"{def.Label} available ({quality})"
                : def.UnavailableReason;

            factors.Add(new GreenScoreFactor(
                def.Key,
                def.Label,
                isAvailable,
                isAvailable ? null : def.UnavailableReason,
                quality,
                points,
                maxPoints,
                explanation));

            explanations.Add(explanation);
        }

        return new GreenScoreResult(
            score,
            100,
            explanations,
            factors,
            NonCertificationDisclaimer,
            WeightsNote,
            DateTimeOffset.UtcNow);
    }
}

public sealed record GreenScoreFactor(
    string Key,
    string Label,
    bool Available,
    string? UnavailableReason,
    string DataQuality,
    int Points,
    int MaxPoints,
    string Explanation);

public sealed record GreenScoreResult(
    int Score,
    int MaxScore,
    IReadOnlyList<string> Explanations,
    IReadOnlyList<GreenScoreFactor> Factors,
    string NonCertificationDisclaimer,
    string WeightsNote,
    DateTimeOffset ComputedAt);
