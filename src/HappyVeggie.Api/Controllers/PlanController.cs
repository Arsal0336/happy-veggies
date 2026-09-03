using System.Security.Claims;
using HappyVeggie.Application.Planning.GeneratePlan;
using HappyVeggie.Application.Planning.ListPlanHistory;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HappyVeggie.Api.Controllers;

[ApiController]
[Route("api/v1/farms/{farmId:guid}")]
[Authorize(Roles = "Farmer")]
public sealed class PlanController : ControllerBase
{
    private readonly ISender _sender;

    public PlanController(ISender sender)
    {
        _sender = sender;
    }

    private Guid GetFarmerId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost("plan")]
    public async Task<ActionResult<PlanDetailDto>> Generate(
        Guid farmId,
        [FromBody] GeneratePlanRequest body,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new GeneratePlanCommand(farmId, GetFarmerId(), body.Language ?? "en"),
            cancellationToken);
        return Created($"api/v1/farms/{farmId}/plan/{result.Id}", result);
    }

    [HttpGet("plan/history")]
    public async Task<ActionResult<IReadOnlyList<PlanDetailDto>>> History(
        Guid farmId,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new ListPlanHistoryQuery(farmId), cancellationToken);
        return Ok(result);
    }
}

public sealed record GeneratePlanRequest(string? Language);
