using System.Security.Claims;
using HappyVeggie.Application.Farmers.UpdateProfile;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HappyVeggie.Api.Controllers;

[ApiController]
[Route("api/v1/farmers")]
[Authorize(Roles = "Farmer")]
public sealed class FarmerController : ControllerBase
{
    private readonly ISender _sender;

    public FarmerController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost("me/profile")]
    public async Task<ActionResult<UpdateFarmerProfileResponse>> UpdateProfile(
        [FromBody] UpdateProfileRequest body,
        CancellationToken cancellationToken)
    {
        var farmerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var response = await _sender.Send(
            new UpdateFarmerProfileCommand(farmerId, body.Name, body.Language ?? "en"),
            cancellationToken);
        return Ok(response);
    }
}

public sealed record UpdateProfileRequest(string Name, string? Language);
