using MediatR;

namespace HappyVeggie.Application.NeighbourEdges.DeleteNeighbourEdge;

public sealed record DeleteNeighbourEdgeCommand(Guid FarmId, Guid EdgeId) : IRequest<Unit>;

