using System.Diagnostics;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using HappyVeggie.Application.AI.Options;
using HappyVeggie.Application.AI.Schemas;
using HappyVeggie.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HappyVeggie.Infrastructure.Providers;

/// <summary>
/// Alibaba Cloud DashScope (Qwen) via OpenAI-compatible Chat Completions API (GAP-030 / TBD-02).
/// </summary>
public sealed class LiveLlmProvider : ILlmProvider
{
    public const string HttpClientName = "Llm";
    public const string DefaultEndpoint = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
    public const string DefaultModel = "qwen-plus";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IFeatureFlagService _featureFlags;
    private readonly LlmProviderOptions _options;
    private readonly ILlmUsageRecorder? _usageRecorder;
    private readonly ILogger<LiveLlmProvider> _logger;

    public LiveLlmProvider(
        IHttpClientFactory httpClientFactory,
        IFeatureFlagService featureFlags,
        IOptions<LlmProviderOptions> options,
        ILogger<LiveLlmProvider> logger,
        ILlmUsageRecorder? usageRecorder = null)
    {
        _httpClientFactory = httpClientFactory;
        _featureFlags = featureFlags;
        _options = options.Value;
        _logger = logger;
        _usageRecorder = usageRecorder;
    }

    public async Task<LlmChatResponse> CompleteChatAsync(
        IReadOnlyList<LlmMessage> messages,
        LlmOptions options,
        CancellationToken cancellationToken)
    {
        using var cts = CreateTimeoutCts(options, cancellationToken);
        await EnsureLiveReadyAsync(options.RequestType ?? "chat", options.Model, cts.Token);

        var model = ResolveModel(options.Model);
        var sw = Stopwatch.StartNew();
        var completion = await SendChatAsync(messages, options, model, jsonMode: false, jsonSchema: null, cts.Token);
        sw.Stop();

        var content = completion.Choices?.FirstOrDefault()?.Message?.Content?.Trim()
            ?? throw new InvalidOperationException("DashScope returned an empty chat completion.");

        var promptTokens = completion.Usage?.PromptTokens ?? EstimateTokens(messages);
        var completionTokens = completion.Usage?.CompletionTokens ?? Math.Max(40, content.Length / 4);

        await RecordUsageAsync(options.RequestType ?? "chat", model, promptTokens, completionTokens, cts.Token);

        return new LlmChatResponse(content, promptTokens, completionTokens, model, sw.Elapsed);
    }

    public async Task<LlmJsonResponse> CompleteJsonAsync(
        string jsonSchema,
        IReadOnlyList<LlmMessage> messages,
        LlmOptions options,
        CancellationToken cancellationToken)
    {
        using var cts = CreateTimeoutCts(options, cancellationToken);
        await EnsureLiveReadyAsync(options.RequestType ?? "json", options.Model, cts.Token);

        var model = ResolveModel(options.Model);
        var sw = Stopwatch.StartNew();
        var completion = await SendChatAsync(messages, options, model, jsonMode: true, jsonSchema: jsonSchema, cts.Token);
        sw.Stop();

        var raw = completion.Choices?.FirstOrDefault()?.Message?.Content?.Trim()
            ?? throw new InvalidOperationException("DashScope returned an empty JSON completion.");

        raw = StripMarkdownFence(raw);
        var validation = PlanJsonSchema.Validate(raw);

        var promptTokens = completion.Usage?.PromptTokens ?? EstimateTokens(messages);
        var completionTokens = completion.Usage?.CompletionTokens ?? Math.Max(80, raw.Length / 4);

        await RecordUsageAsync(options.RequestType ?? "plan_generation", model, promptTokens, completionTokens, cts.Token);

        return new LlmJsonResponse(raw, validation.IsValid, promptTokens, completionTokens, model, sw.Elapsed);
    }

    private async Task<DashScopeChatCompletion> SendChatAsync(
        IReadOnlyList<LlmMessage> messages,
        LlmOptions options,
        string model,
        bool jsonMode,
        string? jsonSchema,
        CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient(HttpClientName);
        var endpoint = (_options.Endpoint ?? DefaultEndpoint).TrimEnd('/');
        var url = $"{endpoint}/chat/completions";

        var apiMessages = messages
            .Select(m => new DashScopeMessage(NormalizeRole(m.Role), m.Content))
            .ToList();

        if (jsonMode)
        {
            var schemaHint = string.IsNullOrWhiteSpace(jsonSchema)
                ? "Respond with a single valid JSON object only."
                : $"Respond with a single valid JSON object only that matches this schema:\n{jsonSchema}";
            apiMessages.Insert(0, new DashScopeMessage("system", schemaHint));
        }

        // Prefer Urdu body text when the conversation asks for it.
        if (MessagesPreferUrdu(messages))
        {
            apiMessages.Insert(0, new DashScopeMessage(
                "system",
                "The farmer language is Urdu (ur). Write plan section bodies and assistant replies in clear Urdu (Nastaliq-friendly plain text). Keep JSON keys in English."));
        }

        var body = new Dictionary<string, object?>
        {
            ["model"] = model,
            ["messages"] = apiMessages,
            ["temperature"] = (double)(options.Temperature > 0 ? options.Temperature : _options.Temperature),
            ["max_tokens"] = options.MaxTokens > 0 ? options.MaxTokens : _options.MaxTokensPerRequest
        };

        if (jsonMode)
        {
            body["response_format"] = new { type = "json_object" };
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);
        request.Content = new StringContent(JsonSerializer.Serialize(body, JsonOptions), Encoding.UTF8, "application/json");

        _logger.LogInformation("Calling DashScope model {Model} ({Mode})", model, jsonMode ? "json" : "chat");

        using var response = await client.SendAsync(request, cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError(
                "DashScope error {Status}: {Body}",
                (int)response.StatusCode,
                payload.Length > 500 ? payload[..500] : payload);
            throw new InvalidOperationException(
                $"DashScope request failed with status {(int)response.StatusCode}. Check Llm:ApiKey, Llm:Endpoint, and model access.");
        }

        var completion = JsonSerializer.Deserialize<DashScopeChatCompletion>(payload, JsonOptions)
            ?? throw new InvalidOperationException("Could not parse DashScope response.");

        return completion;
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
        if (!liveFlag && !_options.UseLive)
        {
            throw new InvalidOperationException(
                "Live LLM is not enabled. Set Llm:UseLive=true and/or enable feature flag 'llm.live'.");
        }

        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            throw new InvalidOperationException(
                "Llm:ApiKey is not configured. Set a DashScope API key via user-secrets or environment (Llm__ApiKey).");
        }

        _logger.LogDebug(
            "Live LLM ready (Purpose={Purpose}, Model={Model}, Flag={Flag})",
            purpose, model ?? ResolveModel(null), liveFlag || _options.UseLive);
    }

    private string ResolveModel(string? overrideModel)
        => string.IsNullOrWhiteSpace(overrideModel)
            ? (string.IsNullOrWhiteSpace(_options.Model) || _options.Model == "gpt-4o-mini"
                ? DefaultModel
                : _options.Model)
            : overrideModel;

    private async Task RecordUsageAsync(
        string purpose,
        string model,
        int promptTokens,
        int completionTokens,
        CancellationToken cancellationToken)
    {
        if (_usageRecorder is null)
        {
            return;
        }

        // Rough USD estimate for demo analytics; DashScope billing may differ.
        var cost = (promptTokens * 0.0000004m) + (completionTokens * 0.0000012m);
        await _usageRecorder.RecordAsync(
            purpose,
            model,
            promptTokens,
            completionTokens,
            cost,
            farmId: null,
            cancellationToken);
    }

    private static string NormalizeRole(string role)
        => role.Equals("assistant", StringComparison.OrdinalIgnoreCase) ? "assistant"
            : role.Equals("system", StringComparison.OrdinalIgnoreCase) ? "system"
            : "user";

    private static bool MessagesPreferUrdu(IReadOnlyList<LlmMessage> messages)
    {
        var blob = string.Join('\n', messages.Select(m => m.Content));
        return blob.Contains("\"ur\"", StringComparison.OrdinalIgnoreCase)
            || blob.Contains("language\": \"ur\"", StringComparison.OrdinalIgnoreCase)
            || blob.Contains("Urdu", StringComparison.OrdinalIgnoreCase)
            || blob.Contains("زبان: ur", StringComparison.OrdinalIgnoreCase);
    }

    private static string StripMarkdownFence(string raw)
    {
        var trimmed = raw.Trim();
        if (!trimmed.StartsWith("```", StringComparison.Ordinal))
        {
            return trimmed;
        }

        var lines = trimmed.Split('\n');
        if (lines.Length < 3)
        {
            return trimmed;
        }

        return string.Join('\n', lines.Skip(1).TakeWhile(l => !l.StartsWith("```", StringComparison.Ordinal))).Trim();
    }

    private static int EstimateTokens(IReadOnlyList<LlmMessage> messages)
        => Math.Max(1, messages.Sum(m => m.Content.Length / 4));

    private sealed record DashScopeMessage(
        [property: JsonPropertyName("role")] string Role,
        [property: JsonPropertyName("content")] string Content);

    private sealed class DashScopeChatCompletion
    {
        [JsonPropertyName("choices")]
        public List<DashScopeChoice>? Choices { get; set; }

        [JsonPropertyName("usage")]
        public DashScopeUsage? Usage { get; set; }
    }

    private sealed class DashScopeChoice
    {
        [JsonPropertyName("message")]
        public DashScopeMessagePayload? Message { get; set; }
    }

    private sealed class DashScopeMessagePayload
    {
        [JsonPropertyName("content")]
        public string? Content { get; set; }
    }

    private sealed class DashScopeUsage
    {
        [JsonPropertyName("prompt_tokens")]
        public int PromptTokens { get; set; }

        [JsonPropertyName("completion_tokens")]
        public int CompletionTokens { get; set; }
    }
}
