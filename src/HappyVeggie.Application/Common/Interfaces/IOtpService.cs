namespace HappyVeggie.Application.Common.Interfaces;

public interface IOtpService
{
    Task<OtpRequestResult> RequestOtpAsync(string phone, string language, CancellationToken cancellationToken);
    Task<bool> VerifyOtpAsync(string requestId, string phone, string code, CancellationToken cancellationToken);
}

public sealed record OtpRequestResult(string RequestId, bool IsMock);
