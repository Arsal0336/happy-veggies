namespace HappyVeggie.Application.Common.Interfaces;

public interface IPortfolioOptimizerClient
{
    Task<PortfolioOptimizeResult?> OptimizeAsync(
        PortfolioOptimizeRequest request,
        CancellationToken cancellationToken);
}

public sealed record PortfolioOptimizeRequest(
    IReadOnlyList<PortfolioAssetInput> Assets,
    decimal RiskFreeRate = 0.02m);

public sealed record PortfolioAssetInput(
    string Id,
    string Name,
    decimal ExpectedReturn,
    decimal Risk,
    decimal MinWeight,
    decimal MaxWeight,
    string? AreaType,
    decimal Suitability,
    decimal WaterFit,
    decimal GreenFactor);

public sealed record PortfolioOptimizeResult(
    string Status,
    string Method,
    string Engine,
    IReadOnlyList<PortfolioAllocationWeight> Allocations,
    decimal? ExpectedPortfolioReturn,
    decimal? PortfolioVolatility,
    string? Error);

public sealed record PortfolioAllocationWeight(
    string Id,
    string Name,
    decimal Weight,
    string? AreaType);
