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
        Assert.Equal("regional-estimate", data!.ProviderName);
        Assert.NotNull(data.TemperatureC);

        var other = await provider.GetCurrentWeatherAsync(24.8m, 67.0m, CancellationToken.None);
        Assert.NotNull(other);
        Assert.False(
            data.TemperatureC == other!.TemperatureC
            && data.HumidityPercent == other.HumidityPercent
            && data.Condition == other.Condition);
    }

    [Fact]
    public async Task StubSoilProvider_ReturnsData()
    {
        var provider = new StubSoilProvider();
        var data = await provider.GetSoilEstimateAsync(30m, 70m, CancellationToken.None);
        Assert.NotNull(data);
        Assert.Equal("regional-estimate", data!.ProviderName);
    }

    [Fact]
    public async Task LiveOtpProvider_ThrowsNotImplemented()
    {
        var provider = new LiveOtpProvider();
        Assert.False(provider.IsMock);
        await Assert.ThrowsAsync<NotImplementedException>(() =>
            provider.SendOtpAsync("+92300", "en", CancellationToken.None));
    }

    [Fact]
    public async Task LiveWeatherProvider_ThrowsNotImplemented()
    {
        var provider = new LiveWeatherProvider();
        await Assert.ThrowsAsync<NotImplementedException>(() =>
            provider.GetCurrentWeatherAsync(30m, 70m, CancellationToken.None));
    }

    [Fact]
    public async Task LiveSoilProvider_ThrowsNotImplemented()
    {
        var provider = new LiveSoilProvider();
        await Assert.ThrowsAsync<NotImplementedException>(() =>
            provider.GetSoilEstimateAsync(30m, 70m, CancellationToken.None));
    }
}
