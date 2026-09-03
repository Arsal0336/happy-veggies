using HappyVeggie.Application.Common.Interfaces;
using MediatR;

namespace HappyVeggie.Application.Auth.RequestOtp;

public sealed class RequestOtpCommandHandler : IRequestHandler<RequestOtpCommand, RequestOtpResponse>
{
    private readonly IOtpService _otpService;

    public RequestOtpCommandHandler(IOtpService otpService)
    {
        _otpService = otpService;
    }

    public async Task<RequestOtpResponse> Handle(RequestOtpCommand request, CancellationToken cancellationToken)
    {
        var result = await _otpService.RequestOtpAsync(request.Phone, request.Language, cancellationToken);
        var mode = result.IsMock ? "mock" : "live";
        return new RequestOtpResponse(result.RequestId, mode);
    }
}
