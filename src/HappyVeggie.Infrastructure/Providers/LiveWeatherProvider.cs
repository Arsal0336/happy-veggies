using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HappyVeggie.Infrastructure.Providers;

/// <summary>
/// Live weather via Open-Meteo Forecast API (no API key). TBD-04 decided.
/// </summary>
public sealed class LiveWeatherProvider : IWeatherProvider
{
    public const string HttpClientName = "OpenMeteo";

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ProviderOptions _options;
    private readonly ILogger<LiveWeatherProvider> _logger;

    public LiveWeatherProvider(
        IHttpClientFactory httpClientFactory,
        IOptions<ProviderOptions> options,
        ILogger<LiveWeatherProvider> logger)
    {
        _httpClientFactory = httpClientFactory;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<WeatherData?> GetCurrentWeatherAsync(
        decimal lat,
        decimal lng,
        CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient(HttpClientName);
        var timeoutSeconds = Math.Max(5, _options.TimeoutSeconds);
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(TimeSpan.FromSeconds(timeoutSeconds));

        var url =
            $"v1/forecast?latitude={lat.ToString(CultureInfo.InvariantCulture)}" +
            $"&longitude={lng.ToString(CultureInfo.InvariantCulture)}" +
            "&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m" +
            "&wind_speed_unit=kmh&timezone=auto";

        try
        {
            using var response = await client.GetAsync(url, cts.Token);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Open-Meteo returned {Status} for ({Lat},{Lng})",
                    (int)response.StatusCode, lat, lng);
                return null;
            }

            var payload = await response.Content.ReadFromJsonAsync<OpenMeteoResponse>(cancellationToken: cts.Token);
            var current = payload?.Current;
            if (current is null)
                return null;

            DateTimeOffset? observedAt = null;
            if (!string.IsNullOrWhiteSpace(current.Time) &&
                DateTimeOffset.TryParse(current.Time, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var parsed))
            {
                observedAt = parsed.ToUniversalTime();
            }

            return new WeatherData(
                TemperatureC: current.Temperature2m,
                HumidityPercent: current.RelativeHumidity2m,
                WindSpeedKmh: current.WindSpeed10m,
                RainfallMm: current.Precipitation,
                Condition: MapWeatherCode(current.WeatherCode),
                ProviderName: "open-meteo",
                ObservedAt: observedAt ?? DateTimeOffset.UtcNow);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning("Open-Meteo timed out after {Seconds}s", timeoutSeconds);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Open-Meteo request failed");
            return null;
        }
    }

    private static string MapWeatherCode(int? code) => code switch
    {
        0 => "Clear",
        1 or 2 or 3 => "Partly cloudy",
        45 or 48 => "Fog",
        51 or 53 or 55 => "Drizzle",
        61 or 63 or 65 => "Rain",
        66 or 67 => "Freezing rain",
        71 or 73 or 75 or 77 => "Snow",
        80 or 81 or 82 => "Rain showers",
        85 or 86 => "Snow showers",
        95 or 96 or 99 => "Thunderstorm",
        _ => code is null ? "Unknown" : $"WMO {code}"
    };

    private sealed class OpenMeteoResponse
    {
        [JsonPropertyName("current")]
        public OpenMeteoCurrent? Current { get; set; }
    }

    private sealed class OpenMeteoCurrent
    {
        [JsonPropertyName("time")]
        public string? Time { get; set; }

        [JsonPropertyName("temperature_2m")]
        public decimal? Temperature2m { get; set; }

        [JsonPropertyName("relative_humidity_2m")]
        public decimal? RelativeHumidity2m { get; set; }

        [JsonPropertyName("precipitation")]
        public decimal? Precipitation { get; set; }

        [JsonPropertyName("weather_code")]
        public int? WeatherCode { get; set; }

        [JsonPropertyName("wind_speed_10m")]
        public decimal? WindSpeed10m { get; set; }
    }
}
