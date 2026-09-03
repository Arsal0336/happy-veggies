using HappyVeggie.Application.DigitalTwin.Dtos;
using MediatR;

namespace HappyVeggie.Application.DigitalTwin.RefreshTwin;

public sealed record RefreshTwinCommand(Guid FarmId) : IRequest<FarmTwinDto>;
