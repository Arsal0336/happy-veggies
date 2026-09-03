using HappyVeggie.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Nearby;

/// <summary>
/// Provides anonymized aggregate crop statistics from nearby farms.
/// Only aggregates — never exposes individual farmer data.
/// </summary>
public sealed class NearbyFarmsService
{
    private readonly IApplicationDbContext _db;

    public NearbyFarmsService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<CropSuggestionDto>> GetSuggestionsAsync(
        string regionCode,
        Guid excludeFarmId,
        CancellationToken cancellationToken)
    {
        // Aggregate crops grown in the same region (excluding current farm).
        var suggestions = await _db.CropZones
            .AsNoTracking()
            .Where(z => z.Farm.RegionCode == regionCode && z.FarmId != excludeFarmId && !z.IsDeleted && z.CropId != null)
            .GroupBy(z => z.CropId!)
            .Select(g => new CropSuggestionDto(
                g.Key,
                g.Count(),
                "community"))
            .OrderByDescending(s => s.FarmCount)
            .Take(10)
            .ToListAsync(cancellationToken);

        return suggestions;
    }
}

public sealed record CropSuggestionDto(string CropId, int FarmCount, string Source);
