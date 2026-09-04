using HappyVeggie.Application.NeighbourEdges.Dtos;
using MediatR;

namespace HappyVeggie.Application.NeighbourEdges.ListNeighbourEdges;

public sealed record ListNeighbourEdgesQuery(Guid FarmId)
    : IRequest<IReadOnlyList<NeighbourEdgeDto>>;
