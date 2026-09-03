using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Farms.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Farms.GetFarm;

public sealed class GetFarmQueryHandler : IRequestHandler<GetFarmQuery, FarmDto>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public GetFarmQueryHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<FarmDto> Handle(GetFarmQuery request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        var farm = await _db.Farms
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == request.FarmId && !f.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException($"Farm {request.FarmId} not found.");

        return farm.ToDto();
    }
}
