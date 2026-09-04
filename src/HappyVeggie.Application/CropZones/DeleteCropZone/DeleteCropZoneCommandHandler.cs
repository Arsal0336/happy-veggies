using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.CropZones.DeleteCropZone;

public sealed class DeleteCropZoneCommandHandler : IRequestHandler<DeleteCropZoneCommand, Unit>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public DeleteCropZoneCommandHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<Unit> Handle(DeleteCropZoneCommand request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        var zone = await _db.CropZones
            .FirstOrDefaultAsync(
                z => z.Id == request.ZoneId
                     && z.FarmId == request.FarmId
                     && z.ProductionAreaId == request.AreaId
                     && !z.IsDeleted,
                cancellationToken)
            ?? throw new KeyNotFoundException($"Crop zone {request.ZoneId} not found.");

        zone.IsDeleted = true;
        zone.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
