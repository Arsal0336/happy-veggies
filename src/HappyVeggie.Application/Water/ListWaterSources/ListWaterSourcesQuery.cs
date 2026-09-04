using HappyVeggie.Application.Water.Dtos;
using MediatR;

namespace HappyVeggie.Application.Water.ListWaterSources;

public sealed record ListWaterSourcesQuery(Guid FarmId) : IRequest<IReadOnlyList<WaterSourceDto>>;
