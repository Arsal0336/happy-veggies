using HappyVeggie.Application.Common.Interfaces;

namespace HappyVeggie.Infrastructure.Providers;

/// <summary>
/// Live weather provider slot (vendor TBD-04). Throws until a real API is configured.
/// Registered only when <c>Weather:UseLive=true</c>; default DI keeps <see cref="StubWeatherProvider"/>.
/// </summary>
public sealed class LiveWeatherProvider : IWeatherProvider
{
    public Task<WeatherData?> GetCurrentWeatherAsync(decimal lat, decimal lng, CancellationToken cancellationToken)
    {
        throw new NotImplementedException(
            "Live weather provider not yet configured (TBD-04). Set Weather:UseLive=false to use StubWeatherProvider.");
    }
}
