using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Alerts.GetFarmAlerts;

/// <summary>
/// Returns persisted alerts for a farm (GAP-050).
/// </summary>
public sealed class GetFarmAlertsQueryHandler : IRequestHandler<GetFarmAlertsQuery, IReadOnlyList<FarmAlertDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public GetFarmAlertsQueryHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<IReadOnlyList<FarmAlertDto>> Handle(GetFarmAlertsQuery request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        return await _db.Alerts
            .AsNoTracking()
            .Where(a => a.FarmId == request.FarmId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new FarmAlertDto(
                a.Id,
                a.Type,
                a.Severity,
                a.Title,
                a.Body,
                a.IsRead,
                a.SourceSignal,
                a.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}
