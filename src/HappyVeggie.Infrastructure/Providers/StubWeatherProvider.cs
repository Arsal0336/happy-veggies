using HappyVeggie.Application.Common.Interfaces;

namespace HappyVeggie.Infrastructure.Providers;

public sealed class StubWeatherProvider : IWeatherProvider
{
    public Task<WeatherData?> GetCurrentWeatherAsync(decimal lat, decimal lng, CancellationToken cancellationToken)
    {
        var seed = Hash(lat, lng);
        var month = DateTime.UtcNow.Month;
        var coastal = lng >= 66m && lng <= 68.5m && lat <= 26.5m;
        var northern = lat >= 33.5m;

        var baseTemp = month switch
        {
            12 or 1 or 2 => 14m,
            3 or 4 or 11 => 24m,
            5 or 6 => 36m,
            7 or 8 or 9 => 33m,
            _ => 28m
        };

        if (northern) baseTemp -= 4m;
        if (coastal) baseTemp -= 2m;
        baseTemp += (seed % 5) - 2;

        var humidity = coastal ? 68m + (seed % 8) : 42m + (seed % 20);
        var rain = month is 7 or 8 or 9 ? 8m + (seed % 12) : seed % 4;
        var condition = rain >= 10m ? "Monsoon showers" : rain >= 4m ? "Partly cloudy" : "Clear";

        var data = new WeatherData(
            TemperatureC: Math.Clamp(baseTemp, 8m, 46m),
            HumidityPercent: Math.Clamp(humidity, 20m, 90m),
            WindSpeedKmh: 8m + (seed % 10),
            RainfallMm: rain,
            Condition: condition,
            ProviderName: "regional-estimate",
            ObservedAt: DateTimeOffset.UtcNow);

        return Task.FromResult<WeatherData?>(data);
    }

    private static int Hash(decimal lat, decimal lng)
    {
        unchecked
        {
            return Math.Abs((lat * 1000m).GetHashCode() * 397 ^ (lng * 1000m).GetHashCode());
        }
    }
}
