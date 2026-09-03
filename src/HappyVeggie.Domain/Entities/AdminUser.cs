namespace HappyVeggie.Domain.Entities;

public sealed class AdminUser
{
    public Guid Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string? PasswordHash { get; set; }

    public string Role { get; set; } = "Admin";

    public bool MfaEnabled { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? LastLoginAt { get; set; }

    public ICollection<AdminAuditLog> AuditLogs { get; set; } = new List<AdminAuditLog>();
}
