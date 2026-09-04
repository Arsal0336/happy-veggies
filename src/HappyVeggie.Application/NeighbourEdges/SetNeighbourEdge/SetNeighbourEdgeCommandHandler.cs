using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.NeighbourEdges.Dtos;
using HappyVeggie.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.NeighbourEdges.SetNeighbourEdge;

public sealed class SetNeighbourEdgeCommandHandler
    : IRequestHandler<SetNeighbourEdgeCommand, NeighbourEdgeDto>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public SetNeighbourEdgeCommandHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<NeighbourEdgeDto> Handle(
        SetNeighbourEdgeCommand request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        if (request.ZoneAId == request.ZoneBId)
            throw new FluentValidation.ValidationException("zoneAId and zoneBId must be different.");

        // Normalize order so (A,B) and (B,A) are the same edge
        var a = request.ZoneAId.CompareTo(request.ZoneBId) < 0 ? request.ZoneAId : request.ZoneBId;
        var b = request.ZoneAId.CompareTo(request.ZoneBId) < 0 ? request.ZoneBId : request.ZoneAId;

        var zones = await _db.CropZones.AsNoTracking()
            .Where(z => z.FarmId == request.FarmId && !z.IsDeleted &&
                        (z.Id == a || z.Id == b))
            .Select(z => z.Id)
            .ToListAsync(cancellationToken);

        if (zones.Count != 2)
            throw new KeyNotFoundException("Both crop zones must belong to this farm.");

        var existing = await _db.FieldNeighbourEdges
            .FirstOrDefaultAsync(e =>
                e.FarmId == request.FarmId &&
                ((e.CropZoneAId == a && e.CropZoneBId == b) ||
                 (e.CropZoneAId == b && e.CropZoneBId == a)),
                cancellationToken);

        if (existing is not null)
        {
            existing.CropZoneAId = a;
            existing.CropZoneBId = b;
            existing.AdjacencyType = string.IsNullOrWhiteSpace(request.AdjacencyType)
                ? existing.AdjacencyType
                : request.AdjacencyType.Trim();
            existing.Enabled = true;
            existing.Source = "manual_or_admin";
            await _db.SaveChangesAsync(cancellationToken);
            return new NeighbourEdgeDto(
                existing.Id, existing.FarmId, existing.CropZoneAId, existing.CropZoneBId,
                existing.AdjacencyType, existing.Enabled);
        }

        var edge = new FieldNeighbourEdge
        {
            Id = Guid.NewGuid(),
            FarmId = request.FarmId,
            CropZoneAId = a,
            CropZoneBId = b,
            AdjacencyType = string.IsNullOrWhiteSpace(request.AdjacencyType)
                ? "adjacent"
                : request.AdjacencyType.Trim(),
            Source = "manual_or_admin",
            Enabled = true
        };

        _db.FieldNeighbourEdges.Add(edge);
        await _db.SaveChangesAsync(cancellationToken);

        return new NeighbourEdgeDto(
            edge.Id, edge.FarmId, edge.CropZoneAId, edge.CropZoneBId,
            edge.AdjacencyType, edge.Enabled);
    }
}
