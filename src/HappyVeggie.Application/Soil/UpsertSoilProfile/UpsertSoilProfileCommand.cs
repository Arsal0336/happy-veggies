using HappyVeggie.Application.Soil.Dtos;
using MediatR;

namespace HappyVeggie.Application.Soil.UpsertSoilProfile;

public sealed record UpsertSoilProfileCommand(
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
    string? FarmerNotes) : IRequest<SoilProfileDto>;
