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
    [InlineData("123456", false)]
    [InlineData("0000", false)]
    [InlineData("123", false)]
    [InlineData("abcd", false)]
    [InlineData("", false)]
    public async Task ValidateOtp_MockAcceptsOnlyDemoCode(string code, bool expected)
    {
        var provider = new MockOtpProvider();
        var result = await provider.ValidateOtpAsync("req1", "+923001234567", code, CancellationToken.None);
        Assert.Equal(expected, result);
    }
}
