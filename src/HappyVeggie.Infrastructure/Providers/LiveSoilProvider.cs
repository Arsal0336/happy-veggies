using HappyVeggie.Application.Common.Interfaces;

namespace HappyVeggie.Infrastructure.Providers;

/// <summary>
/// Live soil provider slot (vendor TBD-05). Throws until a real API is configured.
/// Registered only when <c>Soil:UseLive=true</c>; default DI keeps <see cref="StubSoilProvider"/>.
/// </summary>
public sealed class LiveSoilProvider : ISoilProvider
{
    public Task<SoilEstimate?> GetSoilEstimateAsync(decimal lat, decimal lng, CancellationToken cancellationToken)
    {
        throw new NotImplementedException(
            "Live soil provider not yet configured (TBD-05). Set Soil:UseLive=false to use StubSoilProvider.");
    }
}
