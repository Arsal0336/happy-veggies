using System.Security.Claims;
using HappyVeggie.Application.Auth.LogoutSession;
using HappyVeggie.Application.Auth.RefreshSession;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HappyVeggie.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
[Authorize(Roles = "Farmer")]
public sealed class AuthSessionController : ControllerBase
{
    private readonly ISender _sender;

    public AuthSessionController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<RefreshSessionResponse>> Refresh(CancellationToken cancellationToken)
    {
        var farmerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _sender.Send(new RefreshFarmerSessionCommand(farmerId), cancellationToken);
        return Ok(result);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        var farmerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _sender.Send(new LogoutFarmerSessionCommand(farmerId), cancellationToken);
        return NoContent();
    }
}
