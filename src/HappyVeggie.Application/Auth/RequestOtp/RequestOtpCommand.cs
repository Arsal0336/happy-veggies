using MediatR;

namespace HappyVeggie.Application.Auth.RequestOtp;

public sealed record RequestOtpCommand(string Phone, string Language) : IRequest<RequestOtpResponse>;

public sealed record RequestOtpResponse(string RequestId, string Mode);
