using HappyVeggie.Application.Auth.RequestOtp;
using HappyVeggie.Application.Auth.VerifyOtp;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HappyVeggie.Api.Controllers;

[ApiController]
[Route("api/v1/auth/otp")]
public sealed class AuthController : ControllerBase
{
    private readonly ISender _sender;

    public AuthController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost("request")]
    [AllowAnonymous]
    public async Task<ActionResult<RequestOtpResponse>> RequestOtp(
        [FromBody] RequestOtpRequest body,
        CancellationToken cancellationToken)
    {
        var response = await _sender.Send(
            new RequestOtpCommand(body.Phone, body.Language ?? "en"),
            cancellationToken);
        return Ok(response);
    }

    [HttpPost("verify")]
    [AllowAnonymous]
    public async Task<ActionResult<VerifyOtpResponse>> VerifyOtp(
        [FromBody] VerifyOtpRequest body,
        CancellationToken cancellationToken)
    {
        var response = await _sender.Send(
            new VerifyOtpCommand(body.RequestId, body.Phone, body.Code),
            cancellationToken);
        return Ok(response);
    }
}

public sealed record RequestOtpRequest(string Phone, string? Language);
public sealed record VerifyOtpRequest(string RequestId, string Phone, string Code);
