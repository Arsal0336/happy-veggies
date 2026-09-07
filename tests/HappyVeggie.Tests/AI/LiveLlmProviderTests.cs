using HappyVeggie.Infrastructure.Providers;
using System.Net;
using System.Net.Http;
using System.Text;
using HappyVeggie.Application.AI.Options;
using HappyVeggie.Application.Common.Interfaces;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace HappyVeggie.Tests.AI;

file sealed class FakeFeatureFlags(bool live) : IFeatureFlagService
{
    public Task<bool> GetBoolAsync(string key, bool defaultValue = false, CancellationToken cancellationToken = default)
        => Task.FromResult(key == "llm.live" ? live : defaultValue);
}

file sealed class StubHttpMessageHandler : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        => Task.FromResult(new HttpResponseMessage(HttpStatusCode.Unauthorized)
        {
            Content = new StringContent("{\"error\":\"invalid_api_key\"}", Encoding.UTF8, "application/json")
        });
}

file sealed class StubHttpClientFactory : IHttpClientFactory
{
    private readonly HttpClient _client;

    public StubHttpClientFactory(HttpMessageHandler handler)
    {
        _client = new HttpClient(handler);
    }

    public HttpClient CreateClient(string name) => _client;
}

public class LiveLlmProviderTests
{
    private static LiveLlmProvider CreateProvider(
        bool liveFlag,
        LlmProviderOptions options,
        IHttpClientFactory? httpClientFactory = null)
    {
        httpClientFactory ??= new StubHttpClientFactory(new StubHttpMessageHandler());
        return new LiveLlmProvider(
            httpClientFactory,
            new FakeFeatureFlags(liveFlag),
            Options.Create(options),
            NullLogger<LiveLlmProvider>.Instance);
    }

    [Fact]
    public async Task CompleteChatAsync_WhenFlagOff_ThrowsInvalidOperation()
    {
        var provider = CreateProvider(
            liveFlag: false,
            new LlmProviderOptions { ApiKey = "key", UseLive = true });

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            provider.CompleteChatAsync(
                [new LlmMessage("user", "hi")],
                new LlmOptions { RequestType = "assistant_chat" },
                CancellationToken.None));
    }

    [Fact]
    public async Task CompleteChatAsync_WhenNoApiKey_ThrowsInvalidOperation()
    {
        var provider = CreateProvider(
            liveFlag: true,
            new LlmProviderOptions { ApiKey = null, UseLive = true });

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            provider.CompleteChatAsync(
                [new LlmMessage("user", "hi")],
                new LlmOptions(),
                CancellationToken.None));
    }

    [Fact]
    public async Task CompleteChatAsync_WhenReadyButVendorFails_ThrowsInvalidOperation()
    {
        var provider = CreateProvider(
            liveFlag: true,
            new LlmProviderOptions { ApiKey = "secret", UseLive = true });

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            provider.CompleteChatAsync(
                [new LlmMessage("user", "hi")],
                new LlmOptions { RequestType = "assistant_chat" },
                CancellationToken.None));

        Assert.Contains("LLM request failed", ex.Message);
    }
}
