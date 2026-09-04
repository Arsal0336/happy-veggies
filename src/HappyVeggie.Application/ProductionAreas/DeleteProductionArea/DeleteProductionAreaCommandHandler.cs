using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.ProductionAreas.DeleteProductionArea;

public sealed class DeleteProductionAreaCommandHandler : IRequestHandler<DeleteProductionAreaCommand, Unit>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public DeleteProductionAreaCommandHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<Unit> Handle(DeleteProductionAreaCommand request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        var area = await _db.ProductionAreas
            .FirstOrDefaultAsync(
                a => a.Id == request.AreaId && a.FarmId == request.FarmId && !a.IsDeleted,
                cancellationToken)
            ?? throw new KeyNotFoundException($"Production area {request.AreaId} not found.");

        var now = DateTimeOffset.UtcNow;
        area.IsDeleted = true;
        area.UpdatedAt = now;

        var zones = await _db.CropZones
            .Where(z => z.ProductionAreaId == request.AreaId && !z.IsDeleted)
            .ToListAsync(cancellationToken);
        foreach (var zone in zones)
        {
            zone.IsDeleted = true;
            zone.UpdatedAt = now;
        }

        await _db.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
