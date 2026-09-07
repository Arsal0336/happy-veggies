namespace HappyVeggie.Application.AI.Options;

/// <summary>
/// Configuration for LLM provider (Doc 04 §2).
/// Bound from appsettings "Llm" section.
/// </summary>
public sealed class LlmProviderOptions
{
    public const string SectionName = "Llm";

    /// <summary>
    /// When true, DI registers <c>LiveLlmProvider</c> (OpenAI-compatible; Groq by default). Default false → stub.
    /// </summary>
    public bool UseLive { get; set; }

    public string Provider { get; set; } = "stub";
    public string Model { get; set; } = "openai/gpt-oss-120b";
    public string? ApiKey { get; set; }
    /// <summary>OpenAI-compatible base URL, e.g. https://api.groq.com/openai/v1</summary>
    public string? Endpoint { get; set; }

    // Token/cost controls (NFR-007, NFR-019)
    public int MaxTokensPerRequest { get; set; } = 4096;
    public int MaxTokensChat { get; set; } = 2048;
    public int MaxTokensPlan { get; set; } = 4096;
    public decimal Temperature { get; set; } = 0.7m;
    public int TimeoutSeconds { get; set; } = 30;

    // Rate limiting
    public int MaxRequestsPerFarmerPerHour { get; set; } = 60;
    public int DailyTokenBudgetPerFarmer { get; set; } = 100_000;

    // Context window
    public int ConversationWindowTurns { get; set; } = 10;
}
