using System.Net.Http.Json;
using System.Text.Json.Serialization;
using HappyVeggie.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace HappyVeggie.Infrastructure.Services;

/// <summary>
/// HTTP client for the PyPortfolioOpt FastAPI sidecar (TBD-11 / GAP-054).
/// </summary>
public sealed class PyPortfolioOptClient : IPortfolioOptimizerClient
{
    public const string HttpClientName = "PortfolioOptimizer";

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PyPortfolioOptClient> _logger;

    public PyPortfolioOptClient(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<PyPortfolioOptClient> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<PortfolioOptimizeResult?> OptimizeAsync(
        PortfolioOptimizeRequest request,
        CancellationToken cancellationToken)
    {
        var useLive = string.Equals(
            _configuration["Portfolio:UseLive"], "true", StringComparison.OrdinalIgnoreCase);
        if (!useLive)
        {
            return new PortfolioOptimizeResult(
                "degraded",
                "disabled",
                "pypfopt",
                Array.Empty<PortfolioAllocationWeight>(),
                null,
                null,
                "Portfolio:UseLive is false. Enable and run the PyPortfolioOpt sidecar.");
        }

        var client = _httpClientFactory.CreateClient(HttpClientName);
        var timeoutSeconds = int.TryParse(_configuration["Portfolio:TimeoutSeconds"], out var t) ? Math.Max(5, t) : 15;
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(TimeSpan.FromSeconds(timeoutSeconds));

        var body = new
        {
            assets = request.Assets.Select(a => new
            {
                id = a.Id,
                name = a.Name,
                expected_return = a.ExpectedReturn,
                risk = a.Risk,
                min_weight = a.MinWeight,
                max_weight = a.MaxWeight,
                area_type = a.AreaType,
                suitability = a.Suitability,
                water_fit = a.WaterFit,
                green_factor = a.GreenFactor
            }),
            risk_free_rate = request.RiskFreeRate
        };

        try
        {
            using var response = await client.PostAsJsonAsync("/optimize", body, cts.Token);
            if (!response.IsSuccessStatusCode)
            {
                var err = await response.Content.ReadAsStringAsync(cts.Token);
                _logger.LogWarning("Portfolio sidecar returned {Status}: {Body}",
                    (int)response.StatusCode, err);
                return new PortfolioOptimizeResult(
                    "degraded",
                    "http_error",
                    "pypfopt",
                    Array.Empty<PortfolioAllocationWeight>(),
                    null,
                    null,
                    $"Optimizer HTTP {(int)response.StatusCode}");
            }

            var payload = await response.Content.ReadFromJsonAsync<OptimizerResponse>(cancellationToken: cts.Token);
            if (payload is null)
                return null;

            var allocations = (payload.Allocations ?? [])
                .Select(a => new PortfolioAllocationWeight(
                    a.Id ?? "",
                    a.Name ?? a.Id ?? "",
                    a.Weight,
                    a.AreaType))
                .Where(a => !string.IsNullOrWhiteSpace(a.Id))
                .ToList();

            return new PortfolioOptimizeResult(
                payload.Status ?? "ok",
                payload.Method ?? "unknown",
                payload.Engine ?? "pypfopt",
                allocations,
                payload.ExpectedPortfolioReturn,
                payload.PortfolioVolatility,
                null);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning("Portfolio sidecar timed out after {Seconds}s", timeoutSeconds);
            return new PortfolioOptimizeResult(
                "degraded",
                "timeout",
                "pypfopt",
                Array.Empty<PortfolioAllocationWeight>(),
                null,
                null,
                "Optimizer timed out");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Portfolio sidecar call failed");
            return new PortfolioOptimizeResult(
                "degraded",
                "unreachable",
                "pypfopt",
                Array.Empty<PortfolioAllocationWeight>(),
                null,
                null,
                "Optimizer unreachable — start services/portfolio-optimizer");
        }
    }

    private sealed class OptimizerResponse
    {
        [JsonPropertyName("status")]
        public string? Status { get; set; }

        [JsonPropertyName("method")]
        public string? Method { get; set; }

        [JsonPropertyName("engine")]
        public string? Engine { get; set; }

        [JsonPropertyName("allocations")]
        public List<OptimizerAllocation>? Allocations { get; set; }

        [JsonPropertyName("expected_portfolio_return")]
        public decimal? ExpectedPortfolioReturn { get; set; }

        [JsonPropertyName("portfolio_volatility")]
        public decimal? PortfolioVolatility { get; set; }
    }

    private sealed class OptimizerAllocation
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("weight")]
        public decimal Weight { get; set; }

        [JsonPropertyName("area_type")]
        public string? AreaType { get; set; }
    }
}
