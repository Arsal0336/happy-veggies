using HappyVeggie.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.System.Health;

public sealed class HealthQueryHandler : IRequestHandler<HealthQuery, HealthResponse>
{
    private readonly IApplicationDbContext _db;

    public HealthQueryHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<HealthResponse> Handle(HealthQuery request, CancellationToken cancellationToken)
    {
        var dbReachable = false;
        var flagsCount = 0;

        try
        {
            flagsCount = await _db.FeatureFlags.AsNoTracking().CountAsync(cancellationToken);
            dbReachable = true;
        }
        catch
        {
            dbReachable = false;
        }

        var status = dbReachable ? "healthy" : "degraded";
        return new HealthResponse(status, DateTimeOffset.UtcNow, dbReachable, flagsCount);
    }
}
