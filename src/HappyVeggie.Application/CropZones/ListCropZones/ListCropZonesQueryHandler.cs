using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.CropZones.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.CropZones.ListCropZones;

public sealed class ListCropZonesQueryHandler : IRequestHandler<ListCropZonesQuery, IReadOnlyList<CropZoneDetailDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public ListCropZonesQueryHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<IReadOnlyList<CropZoneDetailDto>> Handle(ListCropZonesQuery request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        var rows = await _db.CropZones
            .AsNoTracking()
            .Where(z => z.FarmId == request.FarmId && z.ProductionAreaId == request.ProductionAreaId && !z.IsDeleted)
            .ToListAsync(cancellationToken);

        return rows
            .OrderBy(z => z.CreatedAt)
            .Select(z => z.ToDto())
            .ToList();
    }
}
