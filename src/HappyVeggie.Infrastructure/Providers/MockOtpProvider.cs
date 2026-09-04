using HappyVeggie.Application.Common.Interfaces;

namespace HappyVeggie.Infrastructure.Providers;

/// <summary>
/// Mock OTP provider for development. Accepts only the documented demo code 1234.
/// Never logs OTP codes or secrets (GAP-071 / NFR-013).
/// </summary>
public sealed class MockOtpProvider : IOtpProvider
{
    public const string DemoCode = "1234";

    public bool IsMock => true;

    public Task<string> SendOtpAsync(string phone, string language, CancellationToken cancellationToken)
    {
        return Task.FromResult(Guid.NewGuid().ToString("N"));
    }

    public Task<bool> ValidateOtpAsync(string requestId, string phone, string code, CancellationToken cancellationToken)
    {
        var isValid = code == DemoCode;
        return Task.FromResult(isValid);
    }
}
