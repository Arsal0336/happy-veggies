using HappyVeggie.Application.Common.Interfaces;

namespace HappyVeggie.Infrastructure.Providers;

public sealed class StubSoilProvider : ISoilProvider
{
    public Task<SoilEstimate?> GetSoilEstimateAsync(decimal lat, decimal lng, CancellationToken cancellationToken)
    {
        var seed = Math.Abs((lat * 1000m).GetHashCode() * 397 ^ (lng * 1000m).GetHashCode());
        var indusPlain = lat is >= 27m and <= 32m && lng is >= 70m and <= 75m;

        var (type, texture, ph, om) = (seed % 3, indusPlain) switch
        {
            (_, true) => ("Alluvial loam", "Medium", 7.4m, 1.8m),
            (0, _) => ("Sandy loam", "Light", 7.8m, 1.1m),
            (1, _) => ("Clay loam", "Heavy", 7.1m, 2.4m),
            _ => ("Loamy", "Medium", 6.9m, 2.2m)
        };

        ph += (seed % 5) * 0.1m - 0.2m;

        var data = new SoilEstimate(
            SoilType: type,
            Texture: texture,
            PhLevel: Math.Clamp(ph, 6.2m, 8.4m),
            OrganicMatterPercent: om,
            ProviderName: "regional-estimate");

        return Task.FromResult<SoilEstimate?>(data);
    }
}
