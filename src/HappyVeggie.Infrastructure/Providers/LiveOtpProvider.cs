using HappyVeggie.Application.Common.Interfaces;

namespace HappyVeggie.Infrastructure.Providers;

/// <summary>
/// Placeholder live OTP provider. Will integrate with an SMS gateway (e.g. Twilio, local telco API).
/// Currently throws NotImplementedException — select mock vs live via configuration.
/// </summary>
public sealed class LiveOtpProvider : IOtpProvider
{
    public bool IsMock => false;

    public Task<string> SendOtpAsync(string phone, string language, CancellationToken cancellationToken)
    {
        throw new NotImplementedException("Live OTP provider not yet configured. Set Otp:UseMock=true in config.");
    }

    public Task<bool> ValidateOtpAsync(string requestId, string phone, string code, CancellationToken cancellationToken)
    {
        throw new NotImplementedException("Live OTP provider not yet configured.");
    }
}
