using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Farms.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Farms.ListFarms;

public sealed class ListFarmsQueryHandler : IRequestHandler<ListFarmsQuery, IReadOnlyList<FarmDto>>
{
    private readonly IApplicationDbContext _db;

    public ListFarmsQueryHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<FarmDto>> Handle(ListFarmsQuery request, CancellationToken cancellationToken)
    {
        return await _db.Farms
            .AsNoTracking()
            .Where(f => f.FarmerId == request.FarmerId && !f.IsDeleted)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => f.ToDto())
            .ToListAsync(cancellationToken);
    }
}
