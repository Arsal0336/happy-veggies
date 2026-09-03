using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.Planning.GeneratePlan;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Planning.ListPlanHistory;

public sealed class ListPlanHistoryQueryHandler : IRequestHandler<ListPlanHistoryQuery, IReadOnlyList<PlanDetailDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public ListPlanHistoryQueryHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<IReadOnlyList<PlanDetailDto>> Handle(ListPlanHistoryQuery request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        return await _db.FarmPlans
            .AsNoTracking()
            .Where(p => p.FarmId == request.FarmId)
            .OrderByDescending(p => p.Version)
            .Select(p => new PlanDetailDto(
                p.Id, p.FarmId, p.Version,
                p.Language, p.ContentJson, p.ContextUsedJson,
                p.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}
