namespace HappyVeggie.Application.Farms.Dtos;

public sealed record FarmDto(
    Guid Id,
    Guid FarmerId,
    string? Name,
    decimal Lat,
    decimal Lng,
    string RegionCode,
    string RegionLabel,
    decimal AreaAcres,
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
    bool LetAiChooseCrop,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
