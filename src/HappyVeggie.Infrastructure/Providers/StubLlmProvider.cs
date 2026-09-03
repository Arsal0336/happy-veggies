using System.Diagnostics;
using HappyVeggie.Application.Common.Interfaces;

namespace HappyVeggie.Infrastructure.Providers;

/// <summary>
/// Stub LLM provider for development/testing. Returns canned responses.
/// Replace with real provider (OpenAI, Azure OpenAI, etc.) for production.
/// </summary>
public sealed class StubLlmProvider : ILlmProvider
{
    public Task<LlmChatResponse> CompleteChatAsync(
        IReadOnlyList<LlmMessage> messages,
        LlmOptions options,
        CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();

        var lastUserMsg = messages.LastOrDefault(m => m.Role == "user")?.Content ?? "";

        var content = $"I'm your Happy Veggie farm assistant. Based on your farm data, here's my advice regarding: \"{Truncate(lastUserMsg, 100)}\"\n\n" +
                      "This is a stub response. The AI provider will be configured for production use.\n\n" +
                      "⚠️ This is AI-generated advisory content. Not professional agricultural advice.";

        sw.Stop();
        return Task.FromResult(new LlmChatResponse(
            content,
            PromptTokens: EstimateTokens(messages),
            CompletionTokens: 50,
            Model: "stub",
            Latency: sw.Elapsed));
    }

    public Task<LlmJsonResponse> CompleteJsonAsync(
        string jsonSchema,
        IReadOnlyList<LlmMessage> messages,
        LlmOptions options,
        CancellationToken cancellationToken)
    {
        var sw = Stopwatch.StartNew();

        var json = """
        {
            "planSections": [
                {
                    "sectionId": "overview",
                    "title": "Farm Overview",
                    "content": "Based on your farm's current configuration, here is a recommended plan. This is a stub plan generated for development.",
                    "recommendations": ["Review soil data for improved accuracy", "Add water source details for better planning"]
                },
                {
                    "sectionId": "crops",
                    "title": "Crop Recommendations",
                    "content": "Your crop zones have been analyzed. Detailed recommendations will be available when the AI provider is fully configured.",
                    "recommendations": ["Monitor growth stages regularly", "Consider companion planting for compatible crops"]
                },
                {
                    "sectionId": "timeline",
                    "title": "Seasonal Timeline",
                    "content": "A seasonal timeline will be generated based on your region, soil, and weather data.",
                    "recommendations": ["Plan planting windows according to local climate", "Track experimental zones for learning"]
                }
            ],
            "language": "en",
            "disclaimer": "AI-generated plan. Not professional agricultural advice. Verify with local agricultural experts.",
            "generatedAt": "%NOW%"
        }
        """.Replace("%NOW%", DateTimeOffset.UtcNow.ToString("o"));

        sw.Stop();
        return Task.FromResult(new LlmJsonResponse(
            RawJson: json,
            IsValid: true,
            PromptTokens: EstimateTokens(messages),
            CompletionTokens: 150,
            Model: "stub",
            Latency: sw.Elapsed));
    }

    private static int EstimateTokens(IReadOnlyList<LlmMessage> messages)
        => messages.Sum(m => m.Content.Length / 4);

    private static string Truncate(string s, int max)
        => s.Length <= max ? s : s[..max] + "...";
}
