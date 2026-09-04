using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Domain.Entities;
using HappyVeggie.Infrastructure.Persistence;

namespace HappyVeggie.Infrastructure.Services;

public sealed class AdminAuditService : IAdminAuditService
{
    private readonly HappyVeggieDbContext _db;

    public AdminAuditService(HappyVeggieDbContext db)
    {
        _db = db;
    }

    public async Task WriteAsync(
        Guid adminId,
        string action,
        string targetType,
        string? targetId,
        string? metadataJson = null,
        CancellationToken cancellationToken = default)
    {
        _db.AdminAuditLogs.Add(new AdminAuditLog
        {
            Id = Guid.NewGuid(),
            ActorAdminId = adminId,
            Action = action,
            TargetType = targetType,
            TargetId = targetId,
            MetadataJson = metadataJson,
            Timestamp = DateTimeOffset.UtcNow
        });

        await _db.SaveChangesAsync(cancellationToken);
    }
}
