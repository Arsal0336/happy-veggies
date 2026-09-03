namespace HappyVeggie.Domain.Entities;

public sealed class Crop
{
    public string Id { get; set; } = string.Empty;

    public string NameEn { get; set; } = string.Empty;

    public string NameUr { get; set; } = string.Empty;

    public string? IconUrl { get; set; }

    public bool Enabled { get; set; } = true;
}

