using HappyVeggie.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Infrastructure.Services;

public sealed class FeatureFlagService : IFeatureFlagService
{
    private readonly IApplicationDbContext _db;

    public FeatureFlagService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<bool> GetBoolAsync(
        string key,
        bool defaultValue = false,
        CancellationToken cancellationToken = default)
    {
        var flag = await _db.FeatureFlags
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.Key == key, cancellationToken);

        return flag?.Enabled ?? defaultValue;
    }
}
