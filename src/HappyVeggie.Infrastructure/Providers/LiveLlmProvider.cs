using HappyVeggie.Application.AI.Options;
using HappyVeggie.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HappyVeggie.Infrastructure.Providers;

/// <summary>
/// Live LLM provider slot (GAP-030 / GAP-003 vendor TBD).
/// Registered only when <c>Llm:UseLive=true</c>. Method bodies throw until a vendor is wired.
/// </summary>
public sealed class LiveLlmProvider : ILlmProvider
{
    private readonly IFeatureFlagService _featureFlags;
    private readonly LlmProviderOptions _options;
    private readonly ILogger<LiveLlmProvider> _logger;

    public LiveLlmProvider(
        IFeatureFlagService featureFlags,
        IOptions<LlmProviderOptions> options,
        ILogger<LiveLlmProvider> logger)
    {
        _featureFlags = featureFlags;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<LlmChatResponse> CompleteChatAsync(
        IReadOnlyList<LlmMessage> messages,
        LlmOptions options,
        CancellationToken cancellationToken)
    {
        using var cts = CreateTimeoutCts(options, cancellationToken);
        await EnsureLiveReadyAsync(options.RequestType ?? "chat", options.Model, cts.Token);
        throw new NotImplementedException("LLM vendor TBD (GAP-003)");
    }

    public async Task<LlmJsonResponse> CompleteJsonAsync(
        string jsonSchema,
        IReadOnlyList<LlmMessage> messages,
        LlmOptions options,
        CancellationToken cancellationToken)
    {
        using var cts = CreateTimeoutCts(options, cancellationToken);
        await EnsureLiveReadyAsync(options.RequestType ?? "json", options.Model, cts.Token);
        throw new NotImplementedException("LLM vendor TBD (GAP-003)");
    }

    private CancellationTokenSource CreateTimeoutCts(LlmOptions options, CancellationToken cancellationToken)
    {
        var timeout = options.Timeout > TimeSpan.Zero
            ? options.Timeout
            : TimeSpan.FromSeconds(Math.Max(1, _options.TimeoutSeconds));
        var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(timeout);
        return cts;
    }

    private async Task EnsureLiveReadyAsync(string purpose, string? model, CancellationToken cancellationToken)
    {
        var liveFlag = await _featureFlags.GetBoolAsync("llm.live", defaultValue: false, cancellationToken);
        if (!liveFlag)
        {
            throw new InvalidOperationException(
                "Live LLM is not enabled. Enable feature flag 'llm.live' or set Llm:UseLive=false to use StubLlmProvider.");
        }

        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            throw new InvalidOperationException(
                "Llm:ApiKey is not configured. Live LLM cannot run without a server-side API key.");
        }

        _logger.LogWarning(
            "Live LLM call attempted (Purpose={Purpose}, Model={Model}) but vendor is not implemented (GAP-003).",
            purpose, model ?? _options.Model);
    }
}
