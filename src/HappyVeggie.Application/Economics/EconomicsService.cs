using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Yield;
using HappyVeggie.Domain.Helpers;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Economics;

public sealed class EconomicsService
{
    private readonly IApplicationDbContext _db;
    private readonly YieldEstimationService _yieldEstimation;

    public EconomicsService(IApplicationDbContext db, YieldEstimationService yieldEstimation)
    {
        _db = db;
        _yieldEstimation = yieldEstimation;
    }

    /// <summary>
    /// ReferenceGrossValue = ConvertedYield(in rate unit) × GovernmentReferenceRate.
    /// Yield density units (t/acre, kg/acre, …) are expanded with zone acres first.
    /// </summary>
    public async Task<EconomicSnapshot?> CalculateForZoneAsync(
        Guid cropZoneId,
        CancellationToken cancellationToken,
        decimal? yieldOverride = null,
        string? unitOverride = null)
    {
        var zone = await _db.CropZones
            .AsNoTracking()
            .FirstOrDefaultAsync(z => z.Id == cropZoneId && !z.IsDeleted, cancellationToken);

        if (zone?.CropId is null)
            return null;

        var expectedYield = yieldOverride ?? zone.ExpectedYieldValue;
        var yieldUnit = unitOverride ?? zone.ExpectedYieldUnit;

        if (expectedYield is null)
        {
            var estimate = await _yieldEstimation.EstimateAsync(
                zone.CropId,
                zone.SeedVarietyId,
                zone.AreaCanonicalValue,
                cancellationToken);
            if (estimate is null)
                return null;

            expectedYield = estimate.EstimatedYield;
            yieldUnit ??= estimate.Unit;
        }

        var rates = await _db.GovernmentCropRates
            .AsNoTracking()
            .Where(r => r.CropId == zone.CropId && r.IsActive)
            .ToListAsync(cancellationToken);

        var rate = rates.OrderByDescending(r => r.CreatedAt).FirstOrDefault();
        if (rate is null)
            return null;

        var rateUnit = YieldUnitConverter.CanonicalCode(rate.Unit);
        yieldUnit = YieldUnitConverter.CanonicalCode(
            !string.IsNullOrWhiteSpace(yieldUnit) ? yieldUnit! : rateUnit);

        var qtyInRateUnit = YieldUnitConverter.ToRateUnit(
            expectedYield.Value,
            yieldUnit,
            rateUnit,
            zone.AreaCanonicalValue);

        if (qtyInRateUnit is null)
            return null;

        var grossValue = qtyInRateUnit.Value * rate.RatePerUnit;

        return new EconomicSnapshot(
            zone.Id,
            zone.CropId,
            expectedYield.Value,
            yieldUnit,
            rate.RatePerUnit,
            rateUnit,
            rate.Currency,
            grossValue,
            qtyInRateUnit.Value,
            rate.Period,
            rate.SourceLabel);
    }

    /// <summary>
    /// Calculate economics for all crop zones in a farm (uses stored yield or heuristic estimate).
    /// </summary>
    public async Task<IReadOnlyList<EconomicSnapshot>> CalculateForFarmAsync(
        Guid farmId,
        CancellationToken cancellationToken)
    {
        var zones = await _db.CropZones
            .AsNoTracking()
            .Where(z => z.FarmId == farmId && !z.IsDeleted && z.CropId != null)
            .ToListAsync(cancellationToken);

        var results = new List<EconomicSnapshot>();
        foreach (var zone in zones)
        {
            var snapshot = await CalculateForZoneAsync(zone.Id, cancellationToken);
            if (snapshot is not null)
                results.Add(snapshot);
        }

        return results;
    }
}

public sealed record EconomicSnapshot(
    Guid CropZoneId,
    string CropId,
    decimal ExpectedYield,
    string YieldUnit,
    decimal RatePerUnit,
    string RateUnit,
    string Currency,
    decimal ReferenceGrossValue,
    decimal YieldInRateUnit,
    string Period,
    string? SourceLabel);
