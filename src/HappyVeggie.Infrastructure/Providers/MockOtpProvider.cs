using HappyVeggie.Application.Common.Interfaces;

namespace HappyVeggie.Infrastructure.Providers;

/// <summary>
/// Mock OTP provider for development. Accepts any 4-8 digit code.
/// Never logs OTP codes or secrets (GAP-071 / NFR-013).
/// </summary>
public sealed class MockOtpProvider : IOtpProvider
{
    public bool IsMock => true;

    public Task<string> SendOtpAsync(string phone, string language, CancellationToken cancellationToken)
    {
        // Returns opaque request id only — no OTP code is generated or logged.
        return Task.FromResult(Guid.NewGuid().ToString("N"));
    }

    public Task<bool> ValidateOtpAsync(string requestId, string phone, string code, CancellationToken cancellationToken)
    {
        // Validate shape only; never log <paramref name="code"/>.
        var isValid = code.Length is >= 4 and <= 8 && code.All(char.IsDigit);
        return Task.FromResult(isValid);
    }
}
