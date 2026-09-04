namespace HappyVeggie.Application.NeighbourEdges.Dtos;

public sealed record NeighbourEdgeDto(
    Guid Id,
    Guid FarmId,
    Guid ZoneAId,
    Guid ZoneBId,
    string AdjacencyType,
    bool Enabled);

public sealed record NeighbourWarningDto(
    Guid ZoneAId,
    string? ZoneALabel,
    Guid ZoneBId,
    string? ZoneBLabel,
    string? Reason);
