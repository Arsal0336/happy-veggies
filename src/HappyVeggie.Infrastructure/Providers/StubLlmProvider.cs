using System.Diagnostics;
using System.Globalization;
using System.Text.Json;
using System.Text.RegularExpressions;
using HappyVeggie.Application.AI.Schemas;
using HappyVeggie.Application.Common.Interfaces;

namespace HappyVeggie.Infrastructure.Providers;

/// <summary>
/// Twin-grounded demo LLM. Builds region-aware plan JSON and assistant answers from prompt context.
/// </summary>
public sealed class StubLlmProvider : ILlmProvider
{
    private readonly ILlmUsageRecorder? _usageRecorder;

    public StubLlmProvider()
    {
    }

    public StubLlmProvider(ILlmUsageRecorder usageRecorder)
    {
        _usageRecorder = usageRecorder;
    }

    public async Task<LlmChatResponse> CompleteChatAsync(
        IReadOnlyList<LlmMessage> messages,
        LlmOptions options,
        CancellationToken cancellationToken)
    {
        using var cts = CreateTimeoutCts(options, cancellationToken);
        cts.Token.ThrowIfCancellationRequested();

        var sw = Stopwatch.StartNew();
        var ctx = FarmContext.FromMessages(messages);
        var lastUserMsg = messages.LastOrDefault(m => m.Role == "user")?.Content ?? "";
        var content = BuildAssistantReply(ctx, lastUserMsg);
        sw.Stop();

        var response = new LlmChatResponse(
            content,
            PromptTokens: EstimateTokens(messages),
            CompletionTokens: Math.Max(40, content.Length / 4),
            Model: "stub",
            Latency: sw.Elapsed);

        await RecordStubUsageAsync(options.RequestType ?? "chat", response.PromptTokens, response.CompletionTokens, cts.Token);
        return response;
    }

    public async Task<LlmJsonResponse> CompleteJsonAsync(
        string jsonSchema,
        IReadOnlyList<LlmMessage> messages,
        LlmOptions options,
        CancellationToken cancellationToken)
    {
        using var cts = CreateTimeoutCts(options, cancellationToken);
        cts.Token.ThrowIfCancellationRequested();

        var sw = Stopwatch.StartNew();
        var ctx = FarmContext.FromMessages(messages);
        var json = BuildPlanJson(ctx);
        sw.Stop();

        var validation = PlanJsonSchema.Validate(json);
        var response = new LlmJsonResponse(
            RawJson: json,
            IsValid: validation.IsValid,
            PromptTokens: EstimateTokens(messages),
            CompletionTokens: Math.Max(80, json.Length / 4),
            Model: "stub",
            Latency: sw.Elapsed);

        await RecordStubUsageAsync(options.RequestType ?? "plan_generation", response.PromptTokens, response.CompletionTokens, cts.Token);
        return response;
    }

    private static string BuildAssistantReply(FarmContext ctx, string question)
    {
        var crop = ctx.Crop ?? "your current crop";
        var region = ctx.Region ?? "your region";
        var q = question.ToLowerInvariant();

        string body;
        if (q.Contains("water") || q.Contains("irrig"))
        {
            body = $"For {crop} in {region}, irrigate in the cool hours and avoid standing water on heavy soils. Match frequency to the latest twin rainfall and water-source notes.";
        }
        else if (q.Contains("fertil") || q.Contains("npk") || q.Contains("nutrient"))
        {
            body = $"Split nitrogen for {crop} rather than one heavy dose. Use the twin soil pH ({ctx.Soil ?? "recorded profile"}) before adding lime or gypsum.";
        }
        else if (q.Contains("pest") || q.Contains("disease"))
        {
            body = $"Scout {crop} twice a week in this season. Remove badly affected leaves and keep neighbouring fields in mind — incompatible neighbours increase pest pressure.";
        }
        else if (q.Contains("yield") || q.Contains("price") || q.Contains("rate"))
        {
            body = $"Yield is an advisory estimate from area, crop, and season — not a guarantee. Check the latest government reference rate in Economics before sales planning.";
        }
        else
        {
            body = $"Next action for this farm: keep {crop} on the seasonal calendar for {region}, refresh the digital twin after weather changes, and follow the latest plan sections for planting and inputs.";
        }

        return $"{body}\n\nThis is AI-generated advisory content. Not professional agricultural advice.";
    }

    private static string BuildPlanJson(FarmContext ctx)
    {
        var crop = ctx.Crop ?? "mixed vegetables";
        var region = ctx.Region ?? "Pakistan";
        var area = ctx.AreaType ?? "open field";
        var month = DateTime.UtcNow.ToString("MMMM", CultureInfo.InvariantCulture);
        var language = ctx.Language;
        var disclaimer = "AI-generated plan. Not professional agricultural advice. Verify with local agricultural experts.";
        var generatedAt = DateTimeOffset.UtcNow.ToString("o");

        var overview =
            $"In {month}, {crop} on {area} land in {region} should follow a tight calendar: land prep this week, then staged planting and irrigation matched to current weather on the twin.";
        var crops =
            $"Prioritise {crop} as the lead crop. Use a compatible neighbour (for example onion with tomato, or marigold borders) and avoid stacking two heavy feeders in adjacent zones.";
        var timeline =
            $"Week 1: soil moisture check and bed prep. Week 2–3: transplant or sow {crop}. Week 4+: weekly scouting, split fertiliser, and harvest window based on variety days-to-maturity.";
        var water =
            "Irrigate early morning. Reduce volume after rainfall recorded on the twin. Drip or furrow is preferred over flood on sandy soils.";
        var soil =
            $"Work with the estimated soil ({ctx.Soil ?? "loam"}) — avoid over-tillage, add compost if organic matter is low, and re-test pH before the next season.";

        var payload = new Dictionary<string, object?>
        {
            ["planSections"] = new object[]
            {
                Section("overview", "Farm overview", overview, new[] { "Refresh the digital twin after any weather event", "Record actual sowing dates on the farm home" }),
                Section("crops", "Crop recommendations", crops, new[] { $"Keep {crop} as the primary commercial crop this cycle", "Check on-farm neighbour compatibility before adding a new zone" }),
                Section("timeline", "Seasonal timeline", timeline, new[] { "Align planting with the local temperature band this month", "Track experimental zones separately from commercial fields" }),
                Section("water", "Water and irrigation", water, new[] { "Do not irrigate immediately after significant rainfall", "Log each irrigation on the water page" }),
                Section("soil", "Soil and nutrition", soil, new[] { "Split nitrogen; avoid one heavy broadcast", "Add organic matter if the twin soil OM is below 2%" }),
                Section("recommendations", "Next actions", $"Complete the {crop} calendar tasks in order and ask the farm assistant if weather shifts.", new[] { "Generate a new plan after adding zones", "Review Green Farm Score after the first irrigation" })
            },
            ["language"] = language,
            ["disclaimer"] = disclaimer,
            ["generatedAt"] = generatedAt
        };

        return JsonSerializer.Serialize(payload);
    }

    private static Dictionary<string, object?> Section(string id, string title, string content, string[] recs) =>
        new()
        {
            ["sectionId"] = id,
            ["title"] = title,
            ["content"] = content,
            ["recommendations"] = recs
        };

    private static CancellationTokenSource CreateTimeoutCts(LlmOptions options, CancellationToken cancellationToken)
    {
        var timeout = options.Timeout > TimeSpan.Zero ? options.Timeout : TimeSpan.FromSeconds(30);
        var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(timeout);
        return cts;
    }

    private async Task RecordStubUsageAsync(
        string purpose, int promptTokens, int completionTokens, CancellationToken cancellationToken)
    {
        if (_usageRecorder is null) return;

        await _usageRecorder.RecordAsync(
            purpose,
            model: "stub",
            promptTokens,
            completionTokens,
            estimatedCostUsd: 0m,
            farmId: null,
            cancellationToken);
    }

    private static int EstimateTokens(IReadOnlyList<LlmMessage> messages)
        => Math.Max(1, messages.Sum(m => m.Content.Length / 4));

    private sealed record FarmContext(string? Crop, string? Region, string? AreaType, string? Soil, string Language)
    {
        public static FarmContext FromMessages(IReadOnlyList<LlmMessage> messages)
        {
            var blob = string.Join('\n', messages.Select(m => m.Content));
            var crop = First(blob, @"crop(?:s)?[:\s]+([A-Za-z]+)", @"\b(tomato|potato|onion|cucumber|capsicum|chili|eggplant|okra|spinach|cabbage|carrot|lettuce)\b");
            var region = First(blob, @"region[:\s]+([A-Za-z ]{3,40})", @"\b(Punjab|Sindh|Khyber|Balochistan|Islamabad|Lahore|Karachi|Peshawar|Multan|Faisalabad)\b");
            var area = First(blob, @"production area[:\s]+([A-Za-z_ ]+)", @"\b(open[_ ]field|greenhouse|shed|tunnel|polyhouse|experimental)\b");
            var soil = First(blob, @"soil[:\s]+([A-Za-z ]{3,30})", null);
            var language = blob.Contains("\"ur\"", StringComparison.OrdinalIgnoreCase) || blob.Contains("Urdu", StringComparison.OrdinalIgnoreCase)
                ? "ur"
                : "en";
            return new FarmContext(crop, region, area, soil, language);
        }

        private static string? First(string blob, string pattern, string? fallbackPattern)
        {
            var match = Regex.Match(blob, pattern, RegexOptions.IgnoreCase);
            if (match.Success)
            {
                return match.Groups.Count > 1 && match.Groups[1].Success
                    ? match.Groups[1].Value.Trim()
                    : match.Value.Trim();
            }

            if (fallbackPattern is null)
            {
                return null;
            }

            match = Regex.Match(blob, fallbackPattern, RegexOptions.IgnoreCase);
            return match.Success ? match.Value.Trim() : null;
        }
    }
}
