using HappyVeggie.Application.CropZones.Dtos;
using MediatR;

namespace HappyVeggie.Application.CropZones.ListCropZones;

public sealed record ListCropZonesQuery(Guid FarmId, Guid ProductionAreaId) : IRequest<IReadOnlyList<CropZoneDetailDto>>;
