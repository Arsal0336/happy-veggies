using HappyVeggie.Application.Farms.Dtos;
using MediatR;

namespace HappyVeggie.Application.Farms.CreateFarm;

public sealed record CreateFarmCommand(
    Guid FarmerId,
    string? Name,
    decimal Lat,
    decimal Lng,
    string RegionCode,
    string RegionLabel,
    decimal AreaInputValue,
    string AreaInputUnit,
    string? PreferredCropId,
    string? PreferredCropFreeText,
    bool IsNewFarmSetup,
    string? SoilType,
    bool? WaterAccess,
    string? WaterSource,
    decimal? BudgetAmount,
    string? BudgetCurrency,
    bool LetAiChooseCrop) : IRequest<FarmDto>;
