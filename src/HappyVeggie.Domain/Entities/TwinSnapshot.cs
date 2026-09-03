namespace HappyVeggie.Domain.Entities;

public sealed class TwinSnapshot
{
    public Guid Id { get; set; }

    public Guid FarmId { get; set; }

    // JSON payload that powers the twin read model + FarmGraphic props.
    public string TwinJson { get; set; } = string.Empty;

    public DateTimeOffset RefreshedAt { get; set; }

    public string? WeatherProviderStatus { get; set; }
    public string? SoilProviderStatus { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Farm Farm { get; set; } = null!;
}

