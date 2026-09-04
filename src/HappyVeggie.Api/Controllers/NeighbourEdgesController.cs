using HappyVeggie.Application.NeighbourEdges.DeleteNeighbourEdge;
using HappyVeggie.Application.NeighbourEdges.Dtos;
using HappyVeggie.Application.NeighbourEdges.ListNeighbourEdges;
using HappyVeggie.Application.NeighbourEdges.ListNeighbourWarnings;
using HappyVeggie.Application.NeighbourEdges.SetNeighbourEdge;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HappyVeggie.Api.Controllers;

[ApiController]
[Route("api/v1/farms/{farmId:guid}")]
[Authorize(Roles = "Farmer")]
public sealed class NeighbourEdgesController : ControllerBase
{
    private readonly ISender _sender;

    public NeighbourEdgesController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("neighbour-edges")]
    public async Task<ActionResult<IReadOnlyList<NeighbourEdgeDto>>> List(
        Guid farmId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new ListNeighbourEdgesQuery(farmId), cancellationToken);
        return Ok(result);
    }

    [HttpPut("neighbour-edges")]
    [HttpPost("neighbour-edges")]
    public async Task<ActionResult<NeighbourEdgeDto>> Set(
        Guid farmId,
        [FromBody] SetNeighbourEdgeRequest body,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new SetNeighbourEdgeCommand(farmId, body.ZoneAId, body.ZoneBId, body.AdjacencyType),
            cancellationToken);
        return Ok(result);
    }

    [HttpDelete("neighbour-edges/{edgeId:guid}")]
    public async Task<IActionResult> Delete(
        Guid farmId, Guid edgeId, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteNeighbourEdgeCommand(farmId, edgeId), cancellationToken);
        return NoContent();
    }

    [HttpGet("neighbour-warnings")]
    public async Task<ActionResult<IReadOnlyList<NeighbourWarningDto>>> Warnings(
        Guid farmId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new ListNeighbourWarningsQuery(farmId), cancellationToken);
        return Ok(result);
    }
}

public sealed record SetNeighbourEdgeRequest(
    Guid ZoneAId,
    Guid ZoneBId,
    string? AdjacencyType);
