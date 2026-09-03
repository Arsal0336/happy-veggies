using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.ProductionAreas.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.ProductionAreas.ListProductionAreas;

public sealed class ListProductionAreasQueryHandler : IRequestHandler<ListProductionAreasQuery, IReadOnlyList<ProductionAreaDetailDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public ListProductionAreasQueryHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<IReadOnlyList<ProductionAreaDetailDto>> Handle(ListProductionAreasQuery request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        return await _db.ProductionAreas
            .AsNoTracking()
            .Where(a => a.FarmId == request.FarmId && !a.IsDeleted)
            .OrderBy(a => a.CreatedAt)
            .Select(a => a.ToDto())
            .ToListAsync(cancellationToken);
    }
}
