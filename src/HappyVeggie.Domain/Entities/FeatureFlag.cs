namespace HappyVeggie.Domain.Entities;

public sealed class FeatureFlag
{
    public Guid Id { get; set; }

    public string Key { get; set; } = string.Empty;

    public bool Enabled { get; set; }

    public string? Description { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Guid? UpdatedByAdminId { get; set; }
}
