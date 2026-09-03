using HappyVeggie.Application.Farms.Dtos;
using MediatR;

namespace HappyVeggie.Application.Farms.UpdateFarm;

public sealed record UpdateFarmCommand(
    Guid FarmId,
    string? Name,
    decimal? Lat,
    decimal? Lng,
    string? RegionCode,
    string? RegionLabel,
    decimal? AreaInputValue,
    string? AreaInputUnit,
    string? PreferredCropId,
    string? PreferredCropFreeText,
    string? SoilType,
    bool? WaterAccess,
    string? WaterSource,
    decimal? BudgetAmount,
    string? BudgetCurrency,
    bool? LetAiChooseCrop) : IRequest<FarmDto>;
