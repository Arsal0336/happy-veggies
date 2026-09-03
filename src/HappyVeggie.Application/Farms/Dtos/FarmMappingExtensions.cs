using HappyVeggie.Domain.Entities;

namespace HappyVeggie.Application.Farms.Dtos;

public static class FarmMappingExtensions
{
    public static FarmDto ToDto(this Farm f) => new(
        f.Id, f.FarmerId, f.Name,
        f.Lat, f.Lng, f.RegionCode, f.RegionLabel,
        f.AreaAcres, f.AreaInputValue, f.AreaInputUnit,
        f.PreferredCropId, f.PreferredCropFreeText,
        f.IsNewFarmSetup, f.SoilType, f.WaterAccess, f.WaterSource,
        f.BudgetAmount, f.BudgetCurrency, f.LetAiChooseCrop,
        f.CreatedAt, f.UpdatedAt);
}
