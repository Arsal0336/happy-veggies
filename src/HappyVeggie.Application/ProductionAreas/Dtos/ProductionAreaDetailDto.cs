using HappyVeggie.Domain.Entities;
using HappyVeggie.Domain.Enums;

namespace HappyVeggie.Application.ProductionAreas.Dtos;

public sealed record ProductionAreaDetailDto(
    Guid Id,
    Guid FarmId,
    string TypeCode,
    string? Name,
    decimal AreaInputValue,
    string AreaInputUnit,
    decimal AreaCanonicalValue,
    decimal? TemperatureC,
    string? TemperatureProvenance,
    decimal? HumidityPercent,
    string? HumidityProvenance,
    string? Ventilation,
    string? GrowingMedium,
    string? StructureType,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public static class ProductionAreaMappingExtensions
{
    public static ProductionAreaDetailDto ToDto(this ProductionArea a) => new(
        a.Id, a.FarmId, a.TypeCode, a.Name,
        a.AreaInputValue, a.AreaInputUnit, a.AreaCanonicalValue,
        a.TemperatureC, a.TemperatureProvenance?.ToString(),
        a.HumidityPercent, a.HumidityProvenance?.ToString(),
        a.Ventilation, a.GrowingMedium, a.StructureType,
        a.CreatedAt, a.UpdatedAt);
}
