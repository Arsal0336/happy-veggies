using MediatR;

namespace HappyVeggie.Application.CropZones.DeleteCropZone;

public sealed record DeleteCropZoneCommand(Guid FarmId, Guid AreaId, Guid ZoneId) : IRequest<Unit>;
