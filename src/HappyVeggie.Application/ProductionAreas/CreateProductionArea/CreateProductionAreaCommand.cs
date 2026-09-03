using HappyVeggie.Application.ProductionAreas.Dtos;
using MediatR;

namespace HappyVeggie.Application.ProductionAreas.CreateProductionArea;

public sealed record CreateProductionAreaCommand(
    Guid FarmId,
    string TypeCode,
    string? Name,
    decimal AreaInputValue,
    string AreaInputUnit,
    decimal? TemperatureC,
    string? TemperatureProvenance,
    decimal? HumidityPercent,
    string? HumidityProvenance,
    string? Ventilation,
    string? GrowingMedium,
    string? StructureType) : IRequest<ProductionAreaDetailDto>;
