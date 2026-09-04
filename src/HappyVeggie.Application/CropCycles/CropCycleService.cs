using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.CropCycles;

/// <summary>
/// Crop cycle learning comparisons (GAP-052). Future recommendation weight updates are TBD-12.
/// </summary>
public sealed class CropCycleService
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public CropCycleService(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<IReadOnlyList<CropCycleDto>> ListForFarmAsync(Guid farmId, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(farmId, cancellationToken);

        var rows = await _db.CropCycles
            .AsNoTracking()
            .Where(c => c.CropZone.FarmId == farmId && !c.CropZone.IsDeleted)
            .Select(c => new CropCycleDto(
                c.Id,
                c.CropZoneId,
                c.CropZone.Label,
                c.CropZone.IsExperimental,
                c.Season,
                c.PredictedYield,
                c.PredictedYieldUnit,
                c.ActualYield,
                c.ActualYieldUnit,
                c.Delta,
                c.Notes,
                c.EndedAt,
                c.CreatedAt,
                c.UpdatedAt))
            .ToListAsync(cancellationToken);

        return rows.OrderByDescending(c => c.UpdatedAt).ToList();
    }

    public async Task<CropCycleDto> RecordActualsAsync(
        Guid farmId,
        Guid cycleId,
        decimal? actualYield,
        string? actualYieldUnit,
        string? notes,
        DateTimeOffset? endedAt,
        CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(farmId, cancellationToken);

        var cycle = await _db.CropCycles
            .Include(c => c.CropZone)
            .FirstOrDefaultAsync(
                c => c.Id == cycleId && c.CropZone.FarmId == farmId && !c.CropZone.IsDeleted,
                cancellationToken)
            ?? throw new KeyNotFoundException($"Crop cycle {cycleId} not found.");

        ApplyActuals(cycle, actualYield, actualYieldUnit, notes, endedAt);
        await _db.SaveChangesAsync(cancellationToken);

        return ToDto(cycle);
    }

    /// <summary>
    /// Ensures a crop cycle exists for a zone/season and records outcome (experimental loop GAP-051).
    /// Never overwrites PredictedYield when setting actuals.
    /// </summary>
    public async Task<CropCycleDto> RecordExperimentalOutcomeAsync(
        Guid farmId,
        Guid zoneId,
        decimal? actualYield,
        string? actualYieldUnit,
        string? notes,
        DateTimeOffset? endedAt,
        decimal? predictedYield,
        string? predictedYieldUnit,
        CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(farmId, cancellationToken);

        var zone = await _db.CropZones
            .FirstOrDefaultAsync(
                z => z.Id == zoneId && z.FarmId == farmId && z.IsExperimental && !z.IsDeleted,
                cancellationToken)
            ?? throw new KeyNotFoundException($"Experimental zone {zoneId} not found.");

        var season = ResolveSeason(DateTimeOffset.UtcNow);
        var cycle = await _db.CropCycles
            .FirstOrDefaultAsync(c => c.CropZoneId == zoneId && c.Season == season, cancellationToken);

        var now = DateTimeOffset.UtcNow;
        if (cycle is null)
        {
            cycle = new CropCycle
            {
                Id = Guid.NewGuid(),
                CropZoneId = zoneId,
                Season = season,
                PredictedYield = predictedYield,
                PredictedYieldUnit = predictedYieldUnit,
                CreatedAt = now,
                UpdatedAt = now
            };
            _db.CropCycles.Add(cycle);
        }
        else if (cycle.PredictedYield is null && predictedYield is not null)
        {
            // Only set predicted when missing — never overwrite.
            cycle.PredictedYield = predictedYield;
            cycle.PredictedYieldUnit = predictedYieldUnit;
        }

        ApplyActuals(cycle, actualYield, actualYieldUnit, notes, endedAt);
        zone.GrowthStage = "completed_experimental";
        zone.UpdatedAt = now;
        await _db.SaveChangesAsync(cancellationToken);

        cycle.CropZone = zone;
        return ToDto(cycle);
    }

    private static void ApplyActuals(
        CropCycle cycle,
        decimal? actualYield,
        string? actualYieldUnit,
        string? notes,
        DateTimeOffset? endedAt)
    {
        // Never overwrite PredictedYield when setting actuals.
        if (actualYield.HasValue)
        {
            cycle.ActualYield = actualYield;
            if (!string.IsNullOrWhiteSpace(actualYieldUnit))
                cycle.ActualYieldUnit = actualYieldUnit;

            cycle.Delta = cycle.PredictedYield.HasValue
                ? actualYield.Value - cycle.PredictedYield.Value
                : null;
        }

        if (notes is not null)
            cycle.Notes = notes;

        if (endedAt.HasValue)
            cycle.EndedAt = endedAt;

        cycle.UpdatedAt = DateTimeOffset.UtcNow;
    }

    private static string ResolveSeason(DateTimeOffset now) =>
        $"{now.Year}-{(now.Month <= 6 ? "Rabi" : "Kharif")}";

    private static CropCycleDto ToDto(CropCycle c) => new(
        c.Id,
        c.CropZoneId,
        c.CropZone?.Label,
        c.CropZone?.IsExperimental ?? false,
        c.Season,
        c.PredictedYield,
        c.PredictedYieldUnit,
        c.ActualYield,
        c.ActualYieldUnit,
        c.Delta,
        c.Notes,
        c.EndedAt,
        c.CreatedAt,
        c.UpdatedAt);
}

public sealed record CropCycleDto(
    Guid Id,
    Guid CropZoneId,
    string? ZoneLabel,
    bool IsExperimental,
    string Season,
    decimal? PredictedYield,
    string? PredictedYieldUnit,
    decimal? ActualYield,
    string? ActualYieldUnit,
    decimal? Delta,
    string? Notes,
    DateTimeOffset? EndedAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
