using HappyVeggie.Application.NeighbourEdges.Dtos;
using MediatR;

namespace HappyVeggie.Application.NeighbourEdges.ListNeighbourWarnings;

public sealed record ListNeighbourWarningsQuery(Guid FarmId)
    : IRequest<IReadOnlyList<NeighbourWarningDto>>;
