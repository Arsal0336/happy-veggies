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
/// OpenAI-compatible Chat Completions client (Groq by default; also works with DashScope/Qwen).
/// </summary>
public sealed class LiveLlmProvider : ILlmProvider
{
    public const string HttpClientName = "Llm";
    public const string DefaultEndpoint = "https://api.groq.com/openai/v1";
    public const string DefaultModel = "openai/gpt-oss-120b";

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

        var content = completion.Choices?.FirstOrDefault()?.Message?.Content?.Trim();
        if (string.IsNullOrWhiteSpace(content))
        {
            throw new InvalidOperationException("LLM returned an empty chat completion.");
        }

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
            ?? throw new InvalidOperationException("LLM returned an empty JSON completion.");

        raw = StripMarkdownFence(raw);
        var validation = PlanJsonSchema.Validate(raw);

        var promptTokens = completion.Usage?.PromptTokens ?? EstimateTokens(messages);
        var completionTokens = completion.Usage?.CompletionTokens ?? Math.Max(80, raw.Length / 4);

        await RecordUsageAsync(options.RequestType ?? "plan_generation", model, promptTokens, completionTokens, cts.Token);

        return new LlmJsonResponse(raw, validation.IsValid, promptTokens, completionTokens, model, sw.Elapsed);
    }

    private async Task<OpenAiChatCompletion> SendChatAsync(
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
            .Select(m => new OpenAiMessage(NormalizeRole(m.Role), m.Content))
            .ToList();

        if (jsonMode)
        {
            var schemaHint = string.IsNullOrWhiteSpace(jsonSchema)
                ? "Respond with a single valid JSON object only."
                : $"Respond with a single valid JSON object only that matches this schema:\n{jsonSchema}";
            apiMessages.Insert(0, new OpenAiMessage("system", schemaHint));
        }

        if (MessagesPreferUrdu(messages))
        {
            apiMessages.Insert(0, new OpenAiMessage(
                "system",
                "The farmer language is Urdu (ur). Write plan section bodies and assistant replies in clear Urdu (Nastaliq-friendly plain text). Keep JSON keys in English."));
        }

        var maxTokens = options.MaxTokens > 0 ? options.MaxTokens : _options.MaxTokensPerRequest;
        var body = new Dictionary<string, object?>
        {
            ["model"] = model,
            ["messages"] = apiMessages,
            ["temperature"] = (double)(options.Temperature > 0 ? options.Temperature : _options.Temperature)
        };

        // Newer Groq/OpenAI models prefer max_completion_tokens; keep max_tokens for older endpoints.
        if (UsesMaxCompletionTokens(model, _options.Provider, _options.Endpoint))
        {
            body["max_completion_tokens"] = maxTokens;
        }
        else
        {
            body["max_tokens"] = maxTokens;
        }

        if (jsonMode)
        {
            body["response_format"] = new { type = "json_object" };
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);
        request.Content = new StringContent(JsonSerializer.Serialize(body, JsonOptions), Encoding.UTF8, "application/json");

        var provider = string.IsNullOrWhiteSpace(_options.Provider) ? "llm" : _options.Provider;
        _logger.LogInformation("Calling {Provider} model {Model} ({Mode})", provider, model, jsonMode ? "json" : "chat");

        using var response = await client.SendAsync(request, cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError(
                "{Provider} error {Status}: {Body}",
                provider,
                (int)response.StatusCode,
                payload.Length > 500 ? payload[..500] : payload);
            throw new InvalidOperationException(
                $"LLM request failed with status {(int)response.StatusCode}. Check Llm:ApiKey, Llm:Endpoint, and model access.");
        }

        var completion = JsonSerializer.Deserialize<OpenAiChatCompletion>(payload, JsonOptions)
            ?? throw new InvalidOperationException("Could not parse LLM response.");

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
                "Llm:ApiKey is not configured. Set a Groq (or other OpenAI-compatible) API key via appsettings.Local.json, user-secrets, or Llm__ApiKey.");
        }

        _logger.LogDebug(
            "Live LLM ready (Provider={Provider}, Purpose={Purpose}, Model={Model}, Flag={Flag})",
            _options.Provider, purpose, model ?? ResolveModel(null), liveFlag || _options.UseLive);
    }

    private string ResolveModel(string? overrideModel)
    {
        if (!string.IsNullOrWhiteSpace(overrideModel))
        {
            return overrideModel;
        }

        if (string.IsNullOrWhiteSpace(_options.Model)
            || _options.Model is "gpt-4o-mini" or "qwen-plus"
            || _options.Model.StartsWith("llama-3.", StringComparison.OrdinalIgnoreCase))
        {
            return DefaultModel;
        }

        return _options.Model;
    }

    private static bool UsesMaxCompletionTokens(string model, string? provider, string? endpoint)
    {
        if (model.Contains("gpt-oss", StringComparison.OrdinalIgnoreCase)
            || model.Contains("qwen3", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        var providerName = provider ?? string.Empty;
        var endpointValue = endpoint ?? string.Empty;
        return providerName.Contains("groq", StringComparison.OrdinalIgnoreCase)
            || endpointValue.Contains("groq.com", StringComparison.OrdinalIgnoreCase);
    }

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

        // Rough USD estimate for demo analytics; provider billing may differ.
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

    private sealed record OpenAiMessage(
        [property: JsonPropertyName("role")] string Role,
        [property: JsonPropertyName("content")] string Content);

    private sealed class OpenAiChatCompletion
    {
        [JsonPropertyName("choices")]
        public List<OpenAiChoice>? Choices { get; set; }

        [JsonPropertyName("usage")]
        public OpenAiUsage? Usage { get; set; }
    }

    private sealed class OpenAiChoice
    {
        [JsonPropertyName("message")]
        public OpenAiMessagePayload? Message { get; set; }
    }

    private sealed class OpenAiMessagePayload
    {
        [JsonPropertyName("content")]
        public string? Content { get; set; }
    }

    private sealed class OpenAiUsage
    {
        [JsonPropertyName("prompt_tokens")]
        public int PromptTokens { get; set; }

        [JsonPropertyName("completion_tokens")]
        public int CompletionTokens { get; set; }
    }
}
