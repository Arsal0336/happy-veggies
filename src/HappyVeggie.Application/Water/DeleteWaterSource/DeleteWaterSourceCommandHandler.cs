using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Water.DeleteWaterSource;

public sealed class DeleteWaterSourceCommandHandler : IRequestHandler<DeleteWaterSourceCommand, Unit>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public DeleteWaterSourceCommandHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<Unit> Handle(DeleteWaterSourceCommand request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        var entity = await _db.WaterSources
            .FirstOrDefaultAsync(
                w => w.Id == request.WaterSourceId && w.FarmId == request.FarmId && !w.IsDeleted,
                cancellationToken)
            ?? throw new KeyNotFoundException($"Water source {request.WaterSourceId} not found.");

        entity.IsDeleted = true;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
