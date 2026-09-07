using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.Water.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Water.ListWaterSources;

public sealed class ListWaterSourcesQueryHandler
    : IRequestHandler<ListWaterSourcesQuery, IReadOnlyList<WaterSourceDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public ListWaterSourcesQueryHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<IReadOnlyList<WaterSourceDto>> Handle(
        ListWaterSourcesQuery request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        var rows = await _db.WaterSources
            .AsNoTracking()
            .Where(w => w.FarmId == request.FarmId && !w.IsDeleted)
            .ToListAsync(cancellationToken);

        return rows
            .OrderBy(w => w.CreatedAt)
            .Select(WaterSourceMapping.ToDto)
            .ToList();
    }
}
