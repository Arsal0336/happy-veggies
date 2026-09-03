using HappyVeggie.Application.Common.Interfaces;

namespace HappyVeggie.Infrastructure.Providers;

/// <summary>
/// Stub soil provider returning sample data. Replace with real API integration.
/// </summary>
public sealed class StubSoilProvider : ISoilProvider
{
    public Task<SoilEstimate?> GetSoilEstimateAsync(decimal lat, decimal lng, CancellationToken cancellationToken)
    {
        var data = new SoilEstimate(
            SoilType: "Loamy",
            Texture: "Medium",
            PhLevel: 7.0m,
            OrganicMatterPercent: 2.5m,
            ProviderName: "stub");

        return Task.FromResult<SoilEstimate?>(data);
    }
}
