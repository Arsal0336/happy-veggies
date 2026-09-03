using HappyVeggie.Infrastructure.Providers;

namespace HappyVeggie.Tests.Providers;

public class StubProviderTests
{
    [Fact]
    public async Task StubWeatherProvider_ReturnsData()
    {
        var provider = new StubWeatherProvider();
        var data = await provider.GetCurrentWeatherAsync(30m, 70m, CancellationToken.None);
        Assert.NotNull(data);
        Assert.Equal("stub", data!.ProviderName);
        Assert.NotNull(data.TemperatureC);
    }

    [Fact]
    public async Task StubSoilProvider_ReturnsData()
    {
        var provider = new StubSoilProvider();
        var data = await provider.GetSoilEstimateAsync(30m, 70m, CancellationToken.None);
        Assert.NotNull(data);
        Assert.Equal("stub", data!.ProviderName);
    }

    [Fact]
    public async Task LiveOtpProvider_ThrowsNotImplemented()
    {
        var provider = new LiveOtpProvider();
        Assert.False(provider.IsMock);
        await Assert.ThrowsAsync<NotImplementedException>(() =>
            provider.SendOtpAsync("+92300", "en", CancellationToken.None));
    }
}
