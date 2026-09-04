using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.NeighbourEdges.DeleteNeighbourEdge;

public sealed class DeleteNeighbourEdgeCommandHandler
    : IRequestHandler<DeleteNeighbourEdgeCommand, Unit>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public DeleteNeighbourEdgeCommandHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<Unit> Handle(DeleteNeighbourEdgeCommand request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        var edge = await _db.FieldNeighbourEdges
            .FirstOrDefaultAsync(e => e.Id == request.EdgeId && e.FarmId == request.FarmId, cancellationToken)
            ?? throw new KeyNotFoundException($"Neighbour edge {request.EdgeId} not found.");

        edge.Enabled = false;
        await _db.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
