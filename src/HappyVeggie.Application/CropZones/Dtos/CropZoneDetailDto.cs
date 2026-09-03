using HappyVeggie.Domain.Entities;

namespace HappyVeggie.Application.CropZones.Dtos;

public sealed record CropZoneDetailDto(
    Guid Id,
    Guid FarmId,
    Guid ProductionAreaId,
    string? Label,
    decimal AreaInputValue,
    string AreaInputUnit,
    decimal AreaCanonicalValue,
    string? CropId,
    string? CropFreetext,
    string? SeedVarietyId,
    DateOnly? PlantingDate,
    string? GrowthStage,
    decimal? ExpectedYieldValue,
    string? ExpectedYieldUnit,
    string? ExpectedYieldProvenance,
    bool IsExperimental,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public static class CropZoneMappingExtensions
{
    public static CropZoneDetailDto ToDto(this CropZone z) => new(
        z.Id, z.FarmId, z.ProductionAreaId, z.Label,
        z.AreaInputValue, z.AreaInputUnit, z.AreaCanonicalValue,
        z.CropId, z.CropFreetext, z.SeedVarietyId,
        z.PlantingDate, z.GrowthStage,
        z.ExpectedYieldValue, z.ExpectedYieldUnit,
        z.ExpectedYieldProvenance?.ToString(),
        z.IsExperimental,
        z.CreatedAt, z.UpdatedAt);
}
