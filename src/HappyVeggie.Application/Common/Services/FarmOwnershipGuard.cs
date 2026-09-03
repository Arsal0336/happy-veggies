using HappyVeggie.Application.Common.Exceptions;
using HappyVeggie.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Common.Services;

/// <summary>
/// Ensures the current farmer owns the specified farm. Throws if not.
/// </summary>
public sealed class FarmOwnershipGuard
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentFarmerService _currentFarmer;

    public FarmOwnershipGuard(IApplicationDbContext db, ICurrentFarmerService currentFarmer)
    {
        _db = db;
        _currentFarmer = currentFarmer;
    }

    public async Task EnsureOwnerAsync(Guid farmId, CancellationToken cancellationToken)
    {
        if (!_currentFarmer.IsAuthenticated)
        {
            throw new UnauthorizedAccessException();
        }

        var farm = await _db.Farms
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == farmId && !f.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException($"Farm {farmId} not found.");

        if (farm.FarmerId != _currentFarmer.FarmerId!.Value)
        {
            throw new ForbiddenAccessException();
        }
    }
}
