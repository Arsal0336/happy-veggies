using HappyVeggie.Application.Common.Interfaces;

namespace HappyVeggie.Infrastructure.Providers;

/// <summary>
/// Stub weather provider returning sample data. Replace with real API integration.
/// </summary>
public sealed class StubWeatherProvider : IWeatherProvider
{
    public Task<WeatherData?> GetCurrentWeatherAsync(decimal lat, decimal lng, CancellationToken cancellationToken)
    {
        var data = new WeatherData(
            TemperatureC: 32m,
            HumidityPercent: 55m,
            WindSpeedKmh: 12m,
            RainfallMm: 0m,
            Condition: "Clear",
            ProviderName: "stub",
            ObservedAt: DateTimeOffset.UtcNow);

        return Task.FromResult<WeatherData?>(data);
    }
}
