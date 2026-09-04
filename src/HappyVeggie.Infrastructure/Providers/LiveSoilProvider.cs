using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HappyVeggie.Infrastructure.Providers;

/// <summary>
/// Live soil estimate via ISRIC SoilGrids REST API v2.0. TBD-05 decided.
/// Degrades to null on timeout/unavailable (API is beta / occasionally paused).
/// </summary>
public sealed class LiveSoilProvider : ISoilProvider
{
    public const string HttpClientName = "SoilGrids";

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ProviderOptions _options;
    private readonly ILogger<LiveSoilProvider> _logger;

    public LiveSoilProvider(
        IHttpClientFactory httpClientFactory,
        IOptions<ProviderOptions> options,
        ILogger<LiveSoilProvider> logger)
    {
        _httpClientFactory = httpClientFactory;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<SoilEstimate?> GetSoilEstimateAsync(
        decimal lat,
        decimal lng,
        CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient(HttpClientName);
        // SoilGrids is often slower than weather; allow a longer bound.
        var timeoutSeconds = Math.Max(15, _options.TimeoutSeconds * 3);
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(TimeSpan.FromSeconds(timeoutSeconds));

        var url =
            "soilgrids/v2.0/properties/query" +
            $"?lon={lng.ToString(CultureInfo.InvariantCulture)}" +
            $"&lat={lat.ToString(CultureInfo.InvariantCulture)}" +
            "&property=phh2o&property=clay&property=sand&property=silt&property=soc" +
            "&depth=0-5cm&value=mean";

        try
        {
            using var response = await client.GetAsync(url, cts.Token);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("SoilGrids returned {Status} for ({Lat},{Lng})",
                    (int)response.StatusCode, lat, lng);
                return null;
            }

            var payload = await response.Content.ReadFromJsonAsync<SoilGridsResponse>(cancellationToken: cts.Token);
            var layers = payload?.Properties?.Layers;
            if (layers is null || layers.Count == 0)
                return null;

            var phRaw = ReadMean(layers, "phh2o");
            var clay = ReadMean(layers, "clay");
            var sand = ReadMean(layers, "sand");
            var silt = ReadMean(layers, "silt");
            var soc = ReadMean(layers, "soc");

            // SoilGrids: phh2o mean is typically ×10 (e.g. 65 → 6.5); clay/sand/silt in g/kg → %.
            decimal? ph = phRaw.HasValue ? Math.Round(phRaw.Value / 10m, 2) : null;
            var clayPct = clay.HasValue ? clay.Value / 10m : (decimal?)null;
            var sandPct = sand.HasValue ? sand.Value / 10m : (decimal?)null;
            var siltPct = silt.HasValue ? silt.Value / 10m : (decimal?)null;
            // soc often dg/kg → convert roughly to % OM (~1.72 factor) when present
            decimal? organicMatter = soc.HasValue
                ? Math.Round(soc.Value / 10m * 1.72m, 2)
                : null;

            if (ph is null && clayPct is null && sandPct is null)
                return null;

            var texture = ClassifyTexture(sandPct, siltPct, clayPct);

            return new SoilEstimate(
                SoilType: texture,
                Texture: texture,
                PhLevel: ph,
                OrganicMatterPercent: organicMatter,
                ProviderName: "isric-soilgrids");
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning("SoilGrids timed out after {Seconds}s", timeoutSeconds);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "SoilGrids request failed");
            return null;
        }
    }

    private static decimal? ReadMean(IReadOnlyList<SoilGridsLayer> layers, string name)
    {
        var layer = layers.FirstOrDefault(l =>
            string.Equals(l.Name, name, StringComparison.OrdinalIgnoreCase));
        var mean = layer?.Depths?.FirstOrDefault()?.Values?.Mean;
        return mean;
    }

    /// <summary>Simplified USDA texture class from sand/silt/clay percentages.</summary>
    private static string? ClassifyTexture(decimal? sand, decimal? silt, decimal? clay)
    {
        if (sand is null || silt is null || clay is null)
            return null;

        var c = clay.Value;
        var s = sand.Value;
        if (c >= 40) return "Clay";
        if (c >= 27 && s <= 45) return "Clay loam";
        if (c >= 20 && s >= 45) return "Sandy clay loam";
        if (s >= 70) return "Sandy loam";
        if (s >= 50) return "Loam";
        if (silt >= 50) return "Silt loam";
        return "Loam";
    }

    private sealed class SoilGridsResponse
    {
        [JsonPropertyName("properties")]
        public SoilGridsProperties? Properties { get; set; }
    }

    private sealed class SoilGridsProperties
    {
        [JsonPropertyName("layers")]
        public List<SoilGridsLayer>? Layers { get; set; }
    }

    private sealed class SoilGridsLayer
    {
        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("depths")]
        public List<SoilGridsDepth>? Depths { get; set; }
    }

    private sealed class SoilGridsDepth
    {
        [JsonPropertyName("values")]
        public SoilGridsValues? Values { get; set; }
    }

    private sealed class SoilGridsValues
    {
        [JsonPropertyName("mean")]
        public decimal? Mean { get; set; }
    }
}
