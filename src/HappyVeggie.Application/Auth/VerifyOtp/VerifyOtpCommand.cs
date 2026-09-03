using MediatR;

namespace HappyVeggie.Application.Auth.VerifyOtp;

public sealed record VerifyOtpCommand(string RequestId, string Phone, string Code) : IRequest<VerifyOtpResponse>;

public sealed record VerifyOtpResponse(string SessionToken, VerifyOtpFarmerDto Farmer, bool IsNew);

public sealed record VerifyOtpFarmerDto(Guid Id, string Phone, string? Name, string Language);
