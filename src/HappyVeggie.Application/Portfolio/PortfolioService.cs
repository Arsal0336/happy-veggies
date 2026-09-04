using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.Economics;
using HappyVeggie.Application.GreenScore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HappyVeggie.Application.Portfolio;

public sealed class PortfolioService
{
    private readonly FarmOwnershipGuard _ownershipGuard;
    private readonly IApplicationDbContext _db;
    private readonly EconomicsService _economics;
    private readonly GreenFarmScoringService _greenScore;
    private readonly IPortfolioOptimizerClient _optimizer;
    private readonly ILogger<PortfolioService> _logger;

    public PortfolioService(
        FarmOwnershipGuard ownershipGuard,
        IApplicationDbContext db,
        EconomicsService economics,
        GreenFarmScoringService greenScore,
        IPortfolioOptimizerClient optimizer,
        ILogger<PortfolioService> logger)
    {
        _ownershipGuard = ownershipGuard;
        _db = db;
        _economics = economics;
        _greenScore = greenScore;
        _optimizer = optimizer;
        _logger = logger;
    }

    public async Task<FarmPortfolioDto> GetAsync(Guid farmId, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(farmId, cancellationToken);

        const string disclaimer =
            "Portfolio allocation is a planning aid using mean-variance optimization (PyPortfolioOpt). " +
            "Sustainability is one soft factor and cannot override suitability, season, or risk (FR-117). " +
            "Not financial advice; government rates are historical reference only.";

        var farm = await _db.Farms.AsNoTracking()
            .FirstAsync(f => f.Id == farmId && !f.IsDeleted, cancellationToken);

        var areas = await _db.ProductionAreas.AsNoTracking()
            .Where(a => a.FarmId == farmId && !a.IsDeleted)
            .ToListAsync(cancellationToken);

        var zones = await _db.CropZones.AsNoTracking()
            .Where(z => z.FarmId == farmId && !z.IsDeleted)
            .ToListAsync(cancellationToken);

        var crops = await _db.Crops.AsNoTracking()
            .Where(c => c.Enabled)
            .ToListAsync(cancellationToken);

        var rates = await _db.GovernmentCropRates.AsNoTracking()
            .Where(r => r.IsActive)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);

        var waterCount = await _db.WaterSources.AsNoTracking()
            .CountAsync(w => w.FarmId == farmId && !w.IsDeleted, cancellationToken);

        var green = await _greenScore.CalculateAsync(farmId, cancellationToken);
        var greenFactor = green.MaxScore > 0
            ? (decimal)green.Score / green.MaxScore
            : 0.5m;

        var totalArea = farm.AreaAcres > 0
            ? farm.AreaAcres
            : areas.Sum(a => a.AreaCanonicalValue);

        if (totalArea <= 0)
            totalArea = 1m;

        // Prefer crops already on farm; otherwise enabled catalog crops with rates.
        var cropIdsOnFarm = zones
            .Where(z => !string.IsNullOrWhiteSpace(z.CropId))
            .Select(z => z.CropId!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var candidateCrops = crops
            .Where(c => cropIdsOnFarm.Count == 0 || cropIdsOnFarm.Contains(c.Id))
            .Take(12)
            .ToList();

        if (candidateCrops.Count == 0)
            candidateCrops = crops.Take(8).ToList();

        var areaType = areas.FirstOrDefault()?.TypeCode ?? "open_field";
        var waterFitBase = waterCount > 0 ? 0.85m : 0.45m;

        var assets = new List<PortfolioAssetInput>();
        var meta = new Dictionary<string, (decimal Suitability, decimal WaterFit, decimal Green)>(StringComparer.OrdinalIgnoreCase);

        foreach (var crop in candidateCrops)
        {
            var rate = rates.FirstOrDefault(r =>
                string.Equals(r.CropId, crop.Id, StringComparison.OrdinalIgnoreCase));

            var zone = zones.FirstOrDefault(z =>
                string.Equals(z.CropId, crop.Id, StringComparison.OrdinalIgnoreCase));

            var yieldValue = zone?.ExpectedYieldValue ?? 1m;
            var gross = rate is null ? yieldValue : yieldValue * rate.RatePerUnit;
            // Normalize expected return into a modest fraction for optimizer stability.
            var expectedReturn = Math.Clamp(gross / 100_000m, 0.02m, 0.45m);

            var suitability = zone is null ? 0.65m : 0.9m;
            var waterFit = waterFitBase;
            var risk = Math.Clamp(0.35m - (suitability * 0.1m) - (waterFit * 0.05m), 0.08m, 0.4m);

            assets.Add(new PortfolioAssetInput(
                crop.Id,
                crop.NameEn,
                expectedReturn,
                risk,
                MinWeight: 0m,
                MaxWeight: candidateCrops.Count == 1 ? 1m : 0.6m,
                areaType,
                suitability,
                waterFit,
                greenFactor));

            meta[crop.Id] = (suitability, waterFit, greenFactor);
        }

        if (assets.Count == 0)
        {
            return new FarmPortfolioDto(
                Status: "empty",
                Reason: "No candidate crops available for portfolio optimization.",
                Engine: "pypfopt",
                Method: "none",
                FarmId: farmId,
                TotalAreaAcres: totalArea,
                Disclaimer: disclaimer,
                Allocations: Array.Empty<PortfolioAllocationDto>(),
                ExpectedPortfolioReturn: null,
                PortfolioVolatility: null);
        }

        var result = await _optimizer.OptimizeAsync(
            new PortfolioOptimizeRequest(assets),
            cancellationToken);

        if (result is null ||
            !string.Equals(result.Status, "ok", StringComparison.OrdinalIgnoreCase) ||
            result.Allocations.Count == 0)
        {
            _logger.LogWarning("Portfolio optimizer unavailable for farm {FarmId}: {Error}",
                farmId, result?.Error ?? "null result");

            return new FarmPortfolioDto(
                Status: "degraded",
                Reason: result?.Error
                    ?? "Portfolio optimizer sidecar unavailable. Start services/portfolio-optimizer (PyPortfolioOpt).",
                Engine: result?.Engine ?? "pypfopt",
                Method: result?.Method ?? "unavailable",
                FarmId: farmId,
                TotalAreaAcres: totalArea,
                Disclaimer: disclaimer,
                Allocations: Array.Empty<PortfolioAllocationDto>(),
                ExpectedPortfolioReturn: null,
                PortfolioVolatility: null);
        }

        var allocations = result.Allocations.Select(a =>
        {
            meta.TryGetValue(a.Id, out var m);
            return new PortfolioAllocationDto(
                a.Id,
                a.Name,
                a.AreaType ?? areaType,
                a.Weight,
                Math.Round(a.Weight * totalArea, 3),
                m.Suitability,
                m.WaterFit,
                m.Green);
        }).ToList();

        return new FarmPortfolioDto(
            Status: "ok",
            Reason: null,
            Engine: result.Engine,
            Method: result.Method,
            FarmId: farmId,
            TotalAreaAcres: totalArea,
            Disclaimer: disclaimer,
            Allocations: allocations,
            ExpectedPortfolioReturn: result.ExpectedPortfolioReturn,
            PortfolioVolatility: result.PortfolioVolatility);
    }
}
