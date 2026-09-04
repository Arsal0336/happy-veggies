namespace HappyVeggie.Application.Soil.Dtos;

public sealed record SoilProfileDto(
    Guid Id,
    Guid FarmId,
    Guid? ProductionAreaId,
    string? SoilType,
    string? SoilTypeProvenance,
    string? Texture,
    string? TextureProvenance,
    decimal? PhValue,
    string? PhValueProvenance,
    decimal? OrganicMatterValue,
    string? OrganicMatterProvenance,
    decimal? NitrogenValue,
    string? NitrogenProvenance,
    decimal? PhosphorusValue,
    string? PhosphorusProvenance,
    decimal? PotassiumValue,
    string? PotassiumProvenance,
    string? FarmerNotes,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
