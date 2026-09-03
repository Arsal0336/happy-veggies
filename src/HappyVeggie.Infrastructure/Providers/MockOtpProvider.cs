using HappyVeggie.Application.Common.Interfaces;

namespace HappyVeggie.Infrastructure.Providers;

/// <summary>
/// Mock OTP provider for development. Accepts any 4-8 digit code.
/// </summary>
public sealed class MockOtpProvider : IOtpProvider
{
    public bool IsMock => true;

    public Task<string> SendOtpAsync(string phone, string language, CancellationToken cancellationToken)
    {
        return Task.FromResult(Guid.NewGuid().ToString("N"));
    }

    public Task<bool> ValidateOtpAsync(string requestId, string phone, string code, CancellationToken cancellationToken)
    {
        var isValid = code.Length is >= 4 and <= 8 && code.All(char.IsDigit);
        return Task.FromResult(isValid);
    }
}
