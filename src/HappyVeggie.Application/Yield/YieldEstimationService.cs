using HappyVeggie.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Yield;

/// <summary>
/// Provides yield estimates based on crop, area, and seed variety.
/// Algorithm TBD — currently uses a simple seed variety maturity-based heuristic.
/// </summary>
public sealed class YieldEstimationService
{
    private readonly IApplicationDbContext _db;

    public YieldEstimationService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<YieldEstimate?> EstimateAsync(
        string cropId,
        string? seedVarietyId,
        decimal areaAcres,
        CancellationToken cancellationToken)
    {
        var crop = await _db.Crops
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == cropId && c.Enabled, cancellationToken);

        if (crop is null) return null;

        // Base yield per acre (simple heuristic; algorithm TBD)
        decimal baseYieldPerAcre = 2000m; // kg/acre default
        string confidence = "low";

        if (seedVarietyId is not null)
        {
            var variety = await _db.SeedVarieties
                .AsNoTracking()
                .FirstOrDefaultAsync(v => v.Id == seedVarietyId && v.Enabled, cancellationToken);

            if (variety is not null)
            {
                // Adjust based on maturity days and risk band
                baseYieldPerAcre = variety.RiskBand switch
                {
                    Domain.Entities.RiskBand.Low => 2500m,
                    Domain.Entities.RiskBand.Medium => 2000m,
                    Domain.Entities.RiskBand.High => 1500m,
                    _ => 2000m
                };
                confidence = "medium";
            }
        }

        var totalYield = baseYieldPerAcre * areaAcres;

        return new YieldEstimate(
            cropId,
            seedVarietyId,
            totalYield,
            "kg",
            confidence,
            $"Heuristic estimate based on {areaAcres:F2} acres");
    }
}

public sealed record YieldEstimate(
    string CropId,
    string? SeedVarietyId,
    decimal EstimatedYield,
    string Unit,
    string Confidence,
    string? Note);
