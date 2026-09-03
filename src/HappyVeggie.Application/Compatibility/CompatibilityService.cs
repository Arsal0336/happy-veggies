using HappyVeggie.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Compatibility;

public sealed class CompatibilityService
{
    private readonly IApplicationDbContext _db;

    public CompatibilityService(IApplicationDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Check compatibility between two crops. Looks up the pair table in both directions.
    /// </summary>
    public async Task<CompatibilityResult> CheckAsync(string cropAId, string cropBId, CancellationToken cancellationToken)
    {
        var entry = await _db.CropCompatibility
            .AsNoTracking()
            .FirstOrDefaultAsync(c =>
                c.Enabled &&
                ((c.CropAId == cropAId && c.CropBId == cropBId) ||
                 (c.CropAId == cropBId && c.CropBId == cropAId)),
                cancellationToken);

        if (entry is null)
            return new CompatibilityResult("neutral", null, null);

        return new CompatibilityResult(
            entry.Relation.ToString().ToLowerInvariant(),
            entry.Reason,
            entry.Scope.ToString().ToLowerInvariant());
    }

    /// <summary>
    /// Get all compatibility entries for a given crop.
    /// </summary>
    public async Task<IReadOnlyList<CompatibilityResult>> GetAllForCropAsync(string cropId, CancellationToken cancellationToken)
    {
        var entries = await _db.CropCompatibility
            .AsNoTracking()
            .Where(c => c.Enabled && (c.CropAId == cropId || c.CropBId == cropId))
            .ToListAsync(cancellationToken);

        return entries.Select(e => new CompatibilityResult(
            e.Relation.ToString().ToLowerInvariant(),
            e.Reason,
            e.Scope.ToString().ToLowerInvariant(),
            e.CropAId == cropId ? e.CropBId : e.CropAId))
            .ToList();
    }

    /// <summary>
    /// Check neighbour compatibility warnings for a farm's crop zones based on field neighbour edges.
    /// </summary>
    public async Task<IReadOnlyList<NeighbourWarning>> CheckNeighboursAsync(Guid farmId, CancellationToken cancellationToken)
    {
        var edges = await _db.FieldNeighbourEdges
            .AsNoTracking()
            .Where(e => e.FarmId == farmId && e.Enabled)
            .ToListAsync(cancellationToken);

        if (edges.Count == 0) return [];

        var zoneIds = edges.SelectMany(e => new[] { e.CropZoneAId, e.CropZoneBId }).Distinct().ToList();
        var zones = await _db.CropZones
            .AsNoTracking()
            .Where(z => zoneIds.Contains(z.Id) && !z.IsDeleted)
            .ToDictionaryAsync(z => z.Id, cancellationToken);

        var warnings = new List<NeighbourWarning>();

        foreach (var edge in edges)
        {
            if (!zones.TryGetValue(edge.CropZoneAId, out var zoneA) ||
                !zones.TryGetValue(edge.CropZoneBId, out var zoneB))
                continue;

            if (zoneA.CropId is null || zoneB.CropId is null) continue;

            var result = await CheckAsync(zoneA.CropId, zoneB.CropId, cancellationToken);
            if (result.Relation == "avoid")
            {
                warnings.Add(new NeighbourWarning(
                    edge.CropZoneAId, zoneA.Label,
                    edge.CropZoneBId, zoneB.Label,
                    result.Reason));
            }
        }

        return warnings;
    }
}

public sealed record CompatibilityResult(string Relation, string? Reason, string? Scope, string? OtherCropId = null);

public sealed record NeighbourWarning(
    Guid ZoneAId, string? ZoneALabel,
    Guid ZoneBId, string? ZoneBLabel,
    string? Reason);
