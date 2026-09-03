namespace HappyVeggie.Application.Common.Interfaces;

/// <summary>
/// Low-level OTP provider abstraction. Implementations: mock (dev), live (production via SMS gateway).
/// IOtpService delegates to this provider.
/// </summary>
public interface IOtpProvider
{
    Task<string> SendOtpAsync(string phone, string language, CancellationToken cancellationToken);
    Task<bool> ValidateOtpAsync(string requestId, string phone, string code, CancellationToken cancellationToken);
    bool IsMock { get; }
}
