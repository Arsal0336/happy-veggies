using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.Compatibility;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Alerts.GetFarmAlerts;

/// <summary>
/// Generates dynamic alerts for a farm dashboard based on current state:
/// - Compatibility warnings (neighbour conflicts)
/// - Missing data (no zones, no water sources, no soil)
/// - Twin staleness
/// </summary>
public sealed class GetFarmAlertsQueryHandler : IRequestHandler<GetFarmAlertsQuery, IReadOnlyList<FarmAlertDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;
    private readonly CompatibilityService _compatibility;

    public GetFarmAlertsQueryHandler(
        IApplicationDbContext db,
        FarmOwnershipGuard ownershipGuard,
        CompatibilityService compatibility)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
        _compatibility = compatibility;
    }

    public async Task<IReadOnlyList<FarmAlertDto>> Handle(GetFarmAlertsQuery request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        var alerts = new List<FarmAlertDto>();
        var now = DateTimeOffset.UtcNow;

        // 1. Compatibility warnings
        var warnings = await _compatibility.CheckNeighboursAsync(request.FarmId, cancellationToken);
        foreach (var w in warnings)
        {
            alerts.Add(new FarmAlertDto(
                "compatibility_warning", "warning",
                $"'{w.ZoneALabel ?? "Zone"}' and '{w.ZoneBLabel ?? "Zone"}' may have compatibility issues: {w.Reason}",
                w.ZoneAId.ToString(), now));
        }

        // 2. No crop zones
        var zoneCount = await _db.CropZones.CountAsync(z => z.FarmId == request.FarmId && !z.IsDeleted, cancellationToken);
        if (zoneCount == 0)
        {
            alerts.Add(new FarmAlertDto("missing_data", "info", "No crop zones configured. Add zones to get yield estimates.", null, now));
        }

        // 3. No water sources
        var waterCount = await _db.WaterSources.CountAsync(w => w.FarmId == request.FarmId && !w.IsDeleted, cancellationToken);
        if (waterCount == 0)
        {
            alerts.Add(new FarmAlertDto("missing_data", "info", "No water sources added. Water data improves planning accuracy.", null, now));
        }

        // 4. No soil profiles
        var soilCount = await _db.SoilProfiles.CountAsync(s => s.FarmId == request.FarmId && !s.IsDeleted, cancellationToken);
        if (soilCount == 0)
        {
            alerts.Add(new FarmAlertDto("missing_data", "info", "No soil profile data. Soil information helps tailor crop recommendations.", null, now));
        }

        // 5. Twin staleness
        var snapshot = await _db.TwinSnapshots.AsNoTracking()
            .FirstOrDefaultAsync(t => t.FarmId == request.FarmId, cancellationToken);
        if (snapshot is null)
        {
            alerts.Add(new FarmAlertDto("stale_data", "warning", "Digital twin has not been refreshed yet.", null, now));
        }
        else if ((now - snapshot.RefreshedAt).TotalDays > 7)
        {
            alerts.Add(new FarmAlertDto("stale_data", "info", "Digital twin data is more than 7 days old. Consider refreshing.", null, now));
        }

        return alerts;
    }
}
