using HappyVeggie.Application.NeighbourEdges.Dtos;
using MediatR;

namespace HappyVeggie.Application.NeighbourEdges.SetNeighbourEdge;

public sealed record SetNeighbourEdgeCommand(
    Guid FarmId,
    Guid ZoneAId,
    Guid ZoneBId,
    string? AdjacencyType) : IRequest<NeighbourEdgeDto>;
