using HappyVeggie.Application.AI.Options;
using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Infrastructure.Providers;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace HappyVeggie.Tests.AI;

file sealed class FakeFeatureFlags(bool live) : IFeatureFlagService
{
    public Task<bool> GetBoolAsync(string key, bool defaultValue = false, CancellationToken cancellationToken = default)
        => Task.FromResult(key == "llm.live" ? live : defaultValue);
}

public class LiveLlmProviderTests
{
    [Fact]
    public async Task CompleteChatAsync_WhenFlagOff_ThrowsInvalidOperation()
    {
        var provider = new LiveLlmProvider(
            new FakeFeatureFlags(live: false),
            Options.Create(new LlmProviderOptions { ApiKey = "key", UseLive = true }),
            NullLogger<LiveLlmProvider>.Instance);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            provider.CompleteChatAsync(
                [new LlmMessage("user", "hi")],
                new LlmOptions { RequestType = "assistant_chat" },
                CancellationToken.None));
    }

    [Fact]
    public async Task CompleteChatAsync_WhenNoApiKey_ThrowsInvalidOperation()
    {
        var provider = new LiveLlmProvider(
            new FakeFeatureFlags(live: true),
            Options.Create(new LlmProviderOptions { ApiKey = null, UseLive = true }),
            NullLogger<LiveLlmProvider>.Instance);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            provider.CompleteChatAsync(
                [new LlmMessage("user", "hi")],
                new LlmOptions(),
                CancellationToken.None));
    }

    [Fact]
    public async Task CompleteChatAsync_WhenReady_ThrowsVendorTbd()
    {
        var provider = new LiveLlmProvider(
            new FakeFeatureFlags(live: true),
            Options.Create(new LlmProviderOptions { ApiKey = "secret", UseLive = true }),
            NullLogger<LiveLlmProvider>.Instance);

        var ex = await Assert.ThrowsAsync<NotImplementedException>(() =>
            provider.CompleteChatAsync(
                [new LlmMessage("user", "hi")],
                new LlmOptions { RequestType = "assistant_chat" },
                CancellationToken.None));

        Assert.Contains("GAP-003", ex.Message);
    }
}
