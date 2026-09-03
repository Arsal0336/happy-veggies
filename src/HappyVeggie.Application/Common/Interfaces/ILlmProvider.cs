namespace HappyVeggie.Application.Common.Interfaces;

/// <summary>
/// Provider abstraction for LLM completions (Doc 04 §2).
/// Swap providers without client changes. No vendor lock-in in domain.
/// </summary>
public interface ILlmProvider
{
    /// <summary>
    /// Standard chat completion returning text.
    /// </summary>
    Task<LlmChatResponse> CompleteChatAsync(
        IReadOnlyList<LlmMessage> messages,
        LlmOptions options,
        CancellationToken cancellationToken);

    /// <summary>
    /// JSON-mode completion for structured output (plan generation).
    /// </summary>
    Task<LlmJsonResponse> CompleteJsonAsync(
        string jsonSchema,
        IReadOnlyList<LlmMessage> messages,
        LlmOptions options,
        CancellationToken cancellationToken);
}

public sealed record LlmMessage(string Role, string Content);

public sealed record LlmOptions
{
    public string? Model { get; init; }
    public int MaxTokens { get; init; } = 2048;
    public decimal Temperature { get; init; } = 0.7m;
    public TimeSpan Timeout { get; init; } = TimeSpan.FromSeconds(30);
    public string? RequestType { get; init; }
}

public sealed record LlmChatResponse(
    string Content,
    int PromptTokens,
    int CompletionTokens,
    string? Model,
    TimeSpan Latency);

public sealed record LlmJsonResponse(
    string RawJson,
    bool IsValid,
    int PromptTokens,
    int CompletionTokens,
    string? Model,
    TimeSpan Latency);
