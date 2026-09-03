using HappyVeggie.Infrastructure.Providers;

namespace HappyVeggie.Tests.Providers;

public class MockOtpProviderTests
{
    [Fact]
    public async Task SendOtp_ReturnsMockRequestId()
    {
        var provider = new MockOtpProvider();
        var requestId = await provider.SendOtpAsync("+923001234567", "en", CancellationToken.None);
        Assert.NotEmpty(requestId);
        Assert.True(provider.IsMock);
    }

    [Theory]
    [InlineData("1234", true)]
    [InlineData("123456", true)]
    [InlineData("12345678", true)]
    [InlineData("123", false)]       // too short
    [InlineData("abcd", false)]      // not digits
    [InlineData("", false)]          // empty
    public async Task ValidateOtp_MockAcceptsValidDigitCodes(string code, bool expected)
    {
        var provider = new MockOtpProvider();
        var result = await provider.ValidateOtpAsync("req1", "+923001234567", code, CancellationToken.None);
        Assert.Equal(expected, result);
    }
}
