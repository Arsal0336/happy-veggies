namespace HappyVeggie.Domain.Entities;

public sealed class GovernmentCropRate
{
    public Guid Id { get; set; }

    public string CropId { get; set; } = string.Empty;

    public string Unit { get; set; } = "kg";

    public decimal RatePerUnit { get; set; }

    public string Currency { get; set; } = "PKR";

    public string Period { get; set; } = string.Empty;

    public string? SourceLabel { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
