namespace HappyVeggie.Domain.Entities;

public sealed class AdminAuditLog
{
    public Guid Id { get; set; }

    public Guid ActorAdminId { get; set; }

    public string Action { get; set; } = string.Empty;

    public string TargetType { get; set; } = string.Empty;

    public string? TargetId { get; set; }

    public string? MetadataJson { get; set; }

    public DateTimeOffset Timestamp { get; set; }

    public AdminUser ActorAdmin { get; set; } = null!;
}
