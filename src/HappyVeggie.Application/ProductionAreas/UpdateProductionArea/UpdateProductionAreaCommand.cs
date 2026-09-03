using HappyVeggie.Application.ProductionAreas.Dtos;
using MediatR;

namespace HappyVeggie.Application.ProductionAreas.UpdateProductionArea;

public sealed record UpdateProductionAreaCommand(
    Guid FarmId,
    Guid AreaId,
    string? Name,
    decimal? AreaInputValue,
    string? AreaInputUnit,
    decimal? TemperatureC,
    decimal? HumidityPercent,
    string? Ventilation,
    string? GrowingMedium,
    string? StructureType) : IRequest<ProductionAreaDetailDto>;
