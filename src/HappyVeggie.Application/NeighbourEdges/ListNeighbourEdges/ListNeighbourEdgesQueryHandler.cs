using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.NeighbourEdges.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.NeighbourEdges.ListNeighbourEdges;

public sealed class ListNeighbourEdgesQueryHandler
    : IRequestHandler<ListNeighbourEdgesQuery, IReadOnlyList<NeighbourEdgeDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public ListNeighbourEdgesQueryHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<IReadOnlyList<NeighbourEdgeDto>> Handle(
        ListNeighbourEdgesQuery request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        return await _db.FieldNeighbourEdges.AsNoTracking()
            .Where(e => e.FarmId == request.FarmId && e.Enabled)
            .OrderBy(e => e.CropZoneAId)
            .Select(e => new NeighbourEdgeDto(
                e.Id, e.FarmId, e.CropZoneAId, e.CropZoneBId, e.AdjacencyType, e.Enabled))
            .ToListAsync(cancellationToken);
    }
}
