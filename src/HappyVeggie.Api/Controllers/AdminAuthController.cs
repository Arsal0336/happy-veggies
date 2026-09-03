using System.Security.Claims;
using HappyVeggie.Application.Admin.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HappyVeggie.Api.Controllers;

[ApiController]
[Route("api/v1/admin")]
public sealed class AdminAuthController : ControllerBase
{
    private readonly ISender _sender;

    public AdminAuthController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost("auth/login")]
    [AllowAnonymous]
    public async Task<ActionResult<AdminLoginResponse>> Login(
        [FromBody] AdminLoginRequest body,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new AdminLoginCommand(body.Email, body.Password),
            cancellationToken);
        return Ok(result);
    }

    [HttpGet("me")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AdminMeDto>> Me(CancellationToken cancellationToken)
    {
        var adminId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _sender.Send(new GetAdminMeQuery(adminId), cancellationToken);
        return Ok(result);
    }
}

public sealed record AdminLoginRequest(string Email, string Password);
