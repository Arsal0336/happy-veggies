namespace HappyVeggie.Application.Portfolio;

public sealed record FarmPortfolioDto(
    string Status,
    string? Reason,
    string Engine,
    string Method,
    Guid FarmId,
    decimal TotalAreaAcres,
    string Disclaimer,
    IReadOnlyList<PortfolioAllocationDto> Allocations,
    decimal? ExpectedPortfolioReturn,
    decimal? PortfolioVolatility);

public sealed record PortfolioAllocationDto(
    string CropId,
    string CropName,
    string? AreaType,
    decimal Weight,
    decimal AllocatedAcres,
    decimal Suitability,
    decimal WaterFit,
    decimal GreenFactor);
