namespace HappyVeggie.Application.Common.Interfaces;

public interface IAdminAuditService
{
    Task WriteAsync(
        Guid adminId,
        string action,
        string targetType,
        string? targetId,
        string? metadataJson = null,
        CancellationToken cancellationToken = default);
}
