using HappyVeggie.Application.CropZones.Dtos;
using MediatR;

namespace HappyVeggie.Application.CropZones.CreateCropZone;

public sealed record CreateCropZoneCommand(
    Guid FarmId,
    Guid ProductionAreaId,
    string? Label,
    decimal AreaInputValue,
    string AreaInputUnit,
    string? CropId,
    string? CropFreetext,
    string? SeedVarietyId,
    DateOnly? PlantingDate,
    string? GrowthStage,
    decimal? ExpectedYieldValue,
    string? ExpectedYieldUnit,
    bool IsExperimental) : IRequest<CropZoneDetailDto>;
