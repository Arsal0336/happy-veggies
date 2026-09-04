using HappyVeggie.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Economics;

public sealed class EconomicsService
{
    private readonly IApplicationDbContext _db;

    public EconomicsService(IApplicationDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// ReferenceGrossValue = ExpectedYield × GovernmentReferenceRate
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
        if (expectedYield is null)
            return null;

        var rates = await _db.GovernmentCropRates
            .AsNoTracking()
            .Where(r => r.CropId == zone.CropId && r.IsActive)
            .ToListAsync(cancellationToken);

        var rate = rates.OrderByDescending(r => r.CreatedAt).FirstOrDefault();

        if (rate is null)
            return null;

        var yieldUnit = unitOverride ?? zone.ExpectedYieldUnit ?? rate.Unit;
        var grossValue = expectedYield.Value * rate.RatePerUnit;

        return new EconomicSnapshot(
            zone.CropId,
            expectedYield.Value,
            yieldUnit,
            rate.RatePerUnit,
            rate.Currency,
            grossValue,
            rate.Period,
            rate.SourceLabel);
    }

    /// <summary>
    /// Calculate economics for all zones in a farm.
    /// </summary>
    public async Task<IReadOnlyList<EconomicSnapshot>> CalculateForFarmAsync(Guid farmId, CancellationToken cancellationToken)
    {
        var zones = await _db.CropZones
            .AsNoTracking()
            .Where(z => z.FarmId == farmId && !z.IsDeleted && z.CropId != null && z.ExpectedYieldValue != null)
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
    string CropId,
    decimal ExpectedYield,
    string YieldUnit,
    decimal RatePerUnit,
    string Currency,
    decimal ReferenceGrossValue,
    string Period,
    string? SourceLabel);
