namespace HappyVeggie.Application.Common.Interfaces;

public interface ISoilProvider
{
    Task<SoilEstimate?> GetSoilEstimateAsync(decimal lat, decimal lng, CancellationToken cancellationToken);
}

public sealed record SoilEstimate(
    string? SoilType,
    string? Texture,
    decimal? PhLevel,
    decimal? OrganicMatterPercent,
    string? ProviderName);
