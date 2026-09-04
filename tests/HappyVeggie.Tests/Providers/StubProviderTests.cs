using System.Net;
using System.Text;
using HappyVeggie.Application.Common.Options;
using HappyVeggie.Infrastructure.Providers;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

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

    [Fact]
    public async Task LiveWeatherProvider_MapsOpenMeteoPayload()
    {
        var json = """
            {
              "current": {
                "time": "2026-09-04T10:00",
                "temperature_2m": 31.5,
                "relative_humidity_2m": 48,
                "precipitation": 0.2,
                "weather_code": 1,
                "wind_speed_10m": 14.2
              }
            }
            """;
        var provider = CreateWeatherProvider(json, HttpStatusCode.OK);
        var data = await provider.GetCurrentWeatherAsync(31.5m, 74.3m, CancellationToken.None);
        Assert.NotNull(data);
        Assert.Equal("open-meteo", data!.ProviderName);
        Assert.Equal(31.5m, data.TemperatureC);
        Assert.Equal(48m, data.HumidityPercent);
        Assert.Equal("Partly cloudy", data.Condition);
    }

    [Fact]
    public async Task LiveSoilProvider_MapsSoilGridsPayload()
    {
        var json = """
            {
              "properties": {
                "layers": [
                  { "name": "phh2o", "depths": [ { "values": { "mean": 72 } } ] },
                  { "name": "clay", "depths": [ { "values": { "mean": 250 } } ] },
                  { "name": "sand", "depths": [ { "values": { "mean": 400 } } ] },
                  { "name": "silt", "depths": [ { "values": { "mean": 350 } } ] },
                  { "name": "soc", "depths": [ { "values": { "mean": 18 } } ] }
                ]
              }
            }
            """;
        var provider = CreateSoilProvider(json, HttpStatusCode.OK);
        var data = await provider.GetSoilEstimateAsync(31.5m, 74.3m, CancellationToken.None);
        Assert.NotNull(data);
        Assert.Equal("isric-soilgrids", data!.ProviderName);
        Assert.Equal(7.2m, data.PhLevel);
        Assert.NotNull(data.Texture);
    }

    private static LiveWeatherProvider CreateWeatherProvider(string body, HttpStatusCode status)
    {
        var handler = new StubHttpHandler(body, status);
        var factory = new StubHttpClientFactory(LiveWeatherProvider.HttpClientName, handler, "https://api.open-meteo.com/");
        return new LiveWeatherProvider(
            factory,
            Options.Create(new ProviderOptions { TimeoutSeconds = 10 }),
            NullLogger<LiveWeatherProvider>.Instance);
    }

    private static LiveSoilProvider CreateSoilProvider(string body, HttpStatusCode status)
    {
        var handler = new StubHttpHandler(body, status);
        var factory = new StubHttpClientFactory(LiveSoilProvider.HttpClientName, handler, "https://rest.isric.org/");
        return new LiveSoilProvider(
            factory,
            Options.Create(new ProviderOptions { TimeoutSeconds = 10 }),
            NullLogger<LiveSoilProvider>.Instance);
    }

    private sealed class StubHttpHandler : HttpMessageHandler
    {
        private readonly string _body;
        private readonly HttpStatusCode _status;

        public StubHttpHandler(string body, HttpStatusCode status)
        {
            _body = body;
            _status = status;
        }

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            var response = new HttpResponseMessage(_status)
            {
                Content = new StringContent(_body, Encoding.UTF8, "application/json")
            };
            return Task.FromResult(response);
        }
    }

    private sealed class StubHttpClientFactory : IHttpClientFactory
    {
        private readonly string _name;
        private readonly HttpMessageHandler _handler;
        private readonly string _baseAddress;

        public StubHttpClientFactory(string name, HttpMessageHandler handler, string baseAddress)
        {
            _name = name;
            _handler = handler;
            _baseAddress = baseAddress;
        }

        public HttpClient CreateClient(string name)
        {
            Assert.Equal(_name, name);
            return new HttpClient(_handler) { BaseAddress = new Uri(_baseAddress) };
        }
    }
}
