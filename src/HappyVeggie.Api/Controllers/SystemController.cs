using HappyVeggie.Application.System.Health;
using HappyVeggie.Application.System.Ping;
using HappyVeggie.Domain.Helpers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HappyVeggie.Api.Controllers;

[ApiController]
[Route("api/v1/system")]
public sealed class SystemController : ControllerBase
{
    private readonly ISender _sender;

    public SystemController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("ping")]
    [AllowAnonymous]
    public async Task<ActionResult<PingResponse>> Ping(CancellationToken cancellationToken)
    {
        var response = await _sender.Send(new PingQuery(), cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// Availability probe (GAP-074): DB reachable + feature-flags count. No external APM.
    /// </summary>
    [HttpGet("health")]
    [AllowAnonymous]
    public async Task<ActionResult<HealthResponse>> Health(CancellationToken cancellationToken)
    {
        var response = await _sender.Send(new HealthQuery(), cancellationToken);
        if (!response.DbReachable)
            return StatusCode(StatusCodes.Status503ServiceUnavailable, response);
        return Ok(response);
    }

    /// <summary>Suggest a region code/label from GPS coordinates (FR-010).</summary>
    [HttpGet("region-suggest")]
    [AllowAnonymous]
    public ActionResult<RegionSuggestion> RegionSuggest([FromQuery] double lat, [FromQuery] double lng)
    {
        if (lat is < -90 or > 90 || lng is < -180 or > 180)
        {
            return BadRequest(new { message = "Invalid coordinates." });
        }

        return Ok(RegionLookup.Suggest(lat, lng));
    }
}
