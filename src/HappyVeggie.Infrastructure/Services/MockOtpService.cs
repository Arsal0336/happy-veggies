using HappyVeggie.Application.Common.Interfaces;

namespace HappyVeggie.Infrastructure.Services;

/// <summary>
/// OTP service that delegates to the registered IOtpProvider.
/// </summary>
public sealed class OtpServiceAdapter : IOtpService
{
    private readonly IOtpProvider _provider;

    public OtpServiceAdapter(IOtpProvider provider)
    {
        _provider = provider;
    }

    public async Task<OtpRequestResult> RequestOtpAsync(string phone, string language, CancellationToken cancellationToken)
    {
        var requestId = await _provider.SendOtpAsync(phone, language, cancellationToken);
        return new OtpRequestResult(requestId, _provider.IsMock);
    }

    public Task<bool> VerifyOtpAsync(string requestId, string phone, string code, CancellationToken cancellationToken)
    {
        return _provider.ValidateOtpAsync(requestId, phone, code, cancellationToken);
    }
}
