using HappyVeggie.Application.Farms.Dtos;
using MediatR;

namespace HappyVeggie.Application.Farms.GetFarm;

public sealed record GetFarmQuery(Guid FarmId) : IRequest<FarmDto>;
