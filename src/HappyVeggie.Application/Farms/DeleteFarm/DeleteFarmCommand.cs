using MediatR;

namespace HappyVeggie.Application.Farms.DeleteFarm;

public sealed record DeleteFarmCommand(Guid FarmId) : IRequest<Unit>;
