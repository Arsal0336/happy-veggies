namespace HappyVeggie.Application.Common.Interfaces;

public interface IWeatherProvider
{
    Task<WeatherData?> GetCurrentWeatherAsync(decimal lat, decimal lng, CancellationToken cancellationToken);
}

public sealed record WeatherData(
    decimal? TemperatureC,
    decimal? HumidityPercent,
    decimal? WindSpeedKmh,
    decimal? RainfallMm,
    string? Condition,
    string? ProviderName,
    DateTimeOffset? ObservedAt);
