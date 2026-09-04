using MediatR;

namespace HappyVeggie.Application.Water.DeleteWaterSource;

public sealed record DeleteWaterSourceCommand(Guid FarmId, Guid WaterSourceId) : IRequest<Unit>;
