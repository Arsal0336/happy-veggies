using HappyVeggie.Application.DigitalTwin.Dtos;
using MediatR;

namespace HappyVeggie.Application.DigitalTwin.GetFarmTwin;

public sealed record GetFarmTwinQuery(Guid FarmId) : IRequest<FarmTwinDto>;
