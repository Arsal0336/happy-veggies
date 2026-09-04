using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Farms.DeleteFarm;

public sealed class DeleteFarmCommandHandler : IRequestHandler<DeleteFarmCommand, Unit>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public DeleteFarmCommandHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<Unit> Handle(DeleteFarmCommand request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        var farm = await _db.Farms
            .FirstOrDefaultAsync(f => f.Id == request.FarmId && !f.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException($"Farm {request.FarmId} not found.");

        var now = DateTimeOffset.UtcNow;
        farm.IsDeleted = true;
        farm.UpdatedAt = now;

        var areas = await _db.ProductionAreas
            .Where(a => a.FarmId == request.FarmId && !a.IsDeleted)
            .ToListAsync(cancellationToken);
        foreach (var area in areas)
        {
            area.IsDeleted = true;
            area.UpdatedAt = now;
        }

        var zones = await _db.CropZones
            .Where(z => z.FarmId == request.FarmId && !z.IsDeleted)
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
