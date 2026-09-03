namespace HappyVeggie.Domain.Entities;

public sealed class Farmer
{
    public Guid Id { get; set; }

    public string Phone { get; set; } = string.Empty;

    public string? Name { get; set; }

    public string Language { get; set; } = "en";

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<Farm> Farms { get; set; } = new List<Farm>();
}
