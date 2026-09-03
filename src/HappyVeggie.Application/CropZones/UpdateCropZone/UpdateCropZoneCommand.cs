using HappyVeggie.Application.CropZones.Dtos;
using MediatR;

namespace HappyVeggie.Application.CropZones.UpdateCropZone;

public sealed record UpdateCropZoneCommand(
    Guid FarmId,
    Guid ZoneId,
    string? Label,
    decimal? AreaInputValue,
    string? AreaInputUnit,
    string? CropId,
    string? CropFreetext,
    string? SeedVarietyId,
    DateOnly? PlantingDate,
    string? GrowthStage,
    decimal? ExpectedYieldValue,
    string? ExpectedYieldUnit) : IRequest<CropZoneDetailDto>;
