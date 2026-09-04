using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Alerts.MarkAlertRead;

public sealed class MarkAlertReadCommandHandler : IRequestHandler<MarkAlertReadCommand, Unit>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public MarkAlertReadCommandHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<Unit> Handle(MarkAlertReadCommand request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        var alert = await _db.Alerts
            .FirstOrDefaultAsync(a => a.Id == request.AlertId && a.FarmId == request.FarmId, cancellationToken)
            ?? throw new KeyNotFoundException($"Alert {request.AlertId} not found.");

        if (!alert.IsRead)
        {
            alert.IsRead = true;
            await _db.SaveChangesAsync(cancellationToken);
        }

        return Unit.Value;
    }
}
