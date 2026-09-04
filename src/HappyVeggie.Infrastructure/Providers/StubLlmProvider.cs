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
        var crop = ctx.Crop ?? (ctx.Language == "ur" ? "آپ کی موجودہ فصل" : "your current crop");
        var region = ctx.Region ?? (ctx.Language == "ur" ? "آپ کے علاقے" : "your region");
        var q = question.ToLowerInvariant();
        var ur = ctx.Language == "ur";
        var weatherNote = FormatWeatherNote(ctx, ur);

        string body;
        if (q.Contains("water") || q.Contains("irrig") || q.Contains("پانی") || q.Contains("آبپاشی"))
        {
            body = ur
                ? $"{region} میں {crop} کے لیے ٹھنڈے اوقات میں آبپاشی کریں اور بھاری مٹی پر کھڑا پانی نہ رہنے دیں۔ {weatherNote} تعدد کو ڈیجیٹل ٹوئن کی بارش اور پانی کے ذرائع کے مطابق رکھیں۔"
                : $"For {crop} in {region}, irrigate in the cool hours and avoid standing water on heavy soils. {weatherNote} Match frequency to the latest twin rainfall and water-source notes.";
        }
        else if (q.Contains("fertil") || q.Contains("npk") || q.Contains("nutrient") || q.Contains("کھاد"))
        {
            body = ur
                ? $"{crop} کے لیے نائٹروجن ایک ساتھ نہ دیں — قسطوں میں دیں۔ چونہ یا جپسم سے پہلے ٹوئن مٹی کا پی ایچ ({ctx.Soil ?? "ریکارڈ شدہ پروفائل"}) دیکھیں۔"
                : $"Split nitrogen for {crop} rather than one heavy dose. Use the twin soil pH ({ctx.Soil ?? "recorded profile"}) before adding lime or gypsum.";
        }
        else if (q.Contains("pest") || q.Contains("disease") || q.Contains("کیڑا") || q.Contains("بیماری"))
        {
            body = ur
                ? $"اس موسم میں {crop} کا ہفتہ میں دو بار معائنہ کریں۔ شدید متاثر پتے ہٹائیں اور پڑوسی فصلوں کا خیال رکھیں — ناموافق پڑوسی کیڑوں کا دباؤ بڑھاتے ہیں۔"
                : $"Scout {crop} twice a week in this season. Remove badly affected leaves and keep neighbouring fields in mind — incompatible neighbours increase pest pressure.";
        }
        else if (q.Contains("yield") || q.Contains("price") || q.Contains("rate") || q.Contains("پیداوار") || q.Contains("قیمت"))
        {
            body = ur
                ? "پیداوار رقبہ، فصل اور موسم سے ایک مشاورتی تخمینہ ہے — ضمانت نہیں۔ فروخت کی منصوبہ بندی سے پہلے Economics میں سرکاری ریفرنس ریٹ چیک کریں۔"
                : $"Yield is an advisory estimate from area, crop, and season — not a guarantee. Check the latest government reference rate in Economics before sales planning.";
        }
        else
        {
            body = ur
                ? $"{region} کے لیے اگلا قدم: {crop} کو موسمی کیلنڈر پر رکھیں، موسم بدلنے پر ڈیجیٹل ٹوئن ریفریش کریں، اور تازہ منصوبے کے مطابق عمل کریں۔ {weatherNote}"
                : $"Next action for this farm: keep {crop} on the seasonal calendar for {region}, refresh the digital twin after weather changes, and follow the latest plan sections for planting and inputs. {weatherNote}";
        }

        var disclaimer = ur
            ? "یہ مصنوعی ذہانت سے تیار کردہ مشاورتی مواد ہے۔ پیشہ ورانہ زرعی مشورہ نہیں۔"
            : "This is AI-generated advisory content. Not professional agricultural advice.";

        var followUps = ur
            ? """["مجھے اس ہفتے آبپاشی کا وقت بتائیں","گرمی سے فصل بچانے کا طریقہ بتائیں","فارم کے لیے اگلا عملی قدم دیں"]"""
            : """["I want irrigation timing for this week","Tell me how to protect crops from heat","Give me the next practical step for my farm"]""";

        return $"{body}\n\n{disclaimer}\n\n<<<FOLLOW_UPS>>>\n{followUps}\n<<<END_FOLLOW_UPS>>>";
    }

    private static string FormatWeatherNote(FarmContext ctx, bool ur)
    {
        if (ctx.TempC is null && string.IsNullOrWhiteSpace(ctx.Condition) && ctx.RainfallMm is null)
        {
            return ur
                ? "ٹوئن پر تازہ موسمی ڈیٹا دستیاب نہیں — ریفریش کے بعد دوبارہ چیک کریں۔"
                : "Twin weather data is not available yet — refresh the twin and check again.";
        }

        var parts = new List<string>();
        if (ctx.TempC is not null)
            parts.Add(ur ? $"درجہ حرارت ≈ {ctx.TempC:0.#}°C" : $"≈ {ctx.TempC:0.#}°C");
        if (!string.IsNullOrWhiteSpace(ctx.Condition))
            parts.Add(ctx.Condition!);
        if (ctx.RainfallMm is not null)
            parts.Add(ur ? $"بارش ≈ {ctx.RainfallMm:0.#} mm" : $"rainfall ≈ {ctx.RainfallMm:0.#} mm");
        if (ctx.Humidity is not null)
            parts.Add(ur ? $"نمی ≈ {ctx.Humidity:0.#}%" : $"humidity ≈ {ctx.Humidity:0.#}%");

        var summary = string.Join(ur ? "، " : ", ", parts);
        return ur
            ? $"موجودہ ٹوئن موسم: {summary}۔"
            : $"Current twin weather: {summary}.";
    }

    private static string BuildPlanJson(FarmContext ctx)
    {
        var crop = ctx.Crop ?? "mixed vegetables";
        var region = ctx.Region ?? "Pakistan";
        var area = ctx.AreaType ?? "open field";
        var month = DateTime.UtcNow.ToString("MMMM", CultureInfo.InvariantCulture);
        var language = ctx.Language;
        var ur = language == "ur";
        var disclaimer = ur
            ? "مصنوعی ذہانت سے تیار کردہ منصوبہ۔ پیشہ ورانہ زرعی مشورہ نہیں۔ مقامی ماہرین سے تصدیق کریں۔"
            : "AI-generated plan. Not professional agricultural advice. Verify with local agricultural experts.";
        var generatedAt = DateTimeOffset.UtcNow.ToString("o");

        string overview, crops, timeline, water, soil;
        string[] overviewRecs, cropRecs, timelineRecs, waterRecs, soilRecs, nextRecs;
        string nextBody;

        if (ur)
        {
            overview =
                $"{month} میں {region} کے {area} پر {crop} کے لیے سخت کیلنڈر رکھیں: اس ہفتے زمین کی تیاری، پھر مرحلہ وار بوائی اور ٹوئن کے موسم کے مطابق آبپاشی۔";
            crops =
                $"اس سائیکل میں {crop} کو مرکزی تجارتی فصل رکھیں۔ موافق پڑوسی (مثلاً ٹماٹر کے ساتھ پیاز، یا گیندے کی پٹی) استعمال کریں اور دو بھاری خوراک والی فصلیں ساتھ نہ لگائیں۔";
            timeline =
                $"ہفتہ ۱: نمی اور بیڈ کی تیاری۔ ہفتہ ۲–۳: {crop} کی منتقلی یا بوائی۔ ہفتہ ۴+: ہفتہ وار معائنہ، قسطوں میں کھاد، اور قسم کے دنوں کے مطابق کٹائی۔";
            water =
                "صبح سویرے آبپاشی کریں۔ ٹوئن پر بارش کے بعد مقدار کم کریں۔ ریتیلی مٹی پر سیلابی آبپاشی سے گریز کریں۔";
            soil =
                $"تخمینی مٹی ({ctx.Soil ?? "لوام"}) کے ساتھ کام کریں — زیادہ ہل نہ چلائیں، نامیاتی مادہ کم ہو تو کمپوسٹ شامل کریں، اگلے موسم سے پہلے پی ایچ دوبارہ جانچیں۔";
            nextBody = $"{crop} کے کیلنڈر کے کام ترتیب سے مکمل کریں اور موسم بدلے تو فارم اسسٹنٹ سے پوچھیں۔";
            overviewRecs = new[] { "کسی بھی موسمی واقعے کے بعد ڈیجیٹل ٹوئن ریفریش کریں", "بوائی کی حقیقی تاریخ فارم ہوم پر درج کریں" };
            cropRecs = new[] { $"اس سائیکل میں {crop} کو مرکزی فصل رکھیں", "نیا زون شامل کرنے سے پہلے پڑوسی مطابقت چیک کریں" };
            timelineRecs = new[] { "اس مہینے کے درجہ حرارت کے بینڈ کے ساتھ بوائی ملائیں", "تجرباتی زونز کو تجارتی کھیتوں سے الگ رکھیں" };
            waterRecs = new[] { "نمایاں بارش کے فوراً بعد آبپاشی نہ کریں", "ہر آبپاشی واٹر صفحے پر درج کریں" };
            soilRecs = new[] { "نائٹروجن قسطوں میں دیں", "اگر ٹوئن OM ۲٪ سے کم ہو تو نامیاتی مادہ بڑھائیں" };
            nextRecs = new[] { "زونز شامل کرنے کے بعد نیا منصوبہ بنائیں", "پہلی آبپاشی کے بعد گرین فارم اسکور دیکھیں" };
        }
        else
        {
            overview =
                $"In {month}, {crop} on {area} land in {region} should follow a tight calendar: land prep this week, then staged planting and irrigation matched to current weather on the twin.";
            crops =
                $"Prioritise {crop} as the lead crop. Use a compatible neighbour (for example onion with tomato, or marigold borders) and avoid stacking two heavy feeders in adjacent zones.";
            timeline =
                $"Week 1: soil moisture check and bed prep. Week 2–3: transplant or sow {crop}. Week 4+: weekly scouting, split fertiliser, and harvest window based on variety days-to-maturity.";
            water =
                "Irrigate early morning. Reduce volume after rainfall recorded on the twin. Drip or furrow is preferred over flood on sandy soils.";
            soil =
                $"Work with the estimated soil ({ctx.Soil ?? "loam"}) — avoid over-tillage, add compost if organic matter is low, and re-test pH before the next season.";
            nextBody = $"Complete the {crop} calendar tasks in order and ask the farm assistant if weather shifts.";
            overviewRecs = new[] { "Refresh the digital twin after any weather event", "Record actual sowing dates on the farm home" };
            cropRecs = new[] { $"Keep {crop} as the primary commercial crop this cycle", "Check on-farm neighbour compatibility before adding a new zone" };
            timelineRecs = new[] { "Align planting with the local temperature band this month", "Track experimental zones separately from commercial fields" };
            waterRecs = new[] { "Do not irrigate immediately after significant rainfall", "Log each irrigation on the water page" };
            soilRecs = new[] { "Split nitrogen; avoid one heavy broadcast", "Add organic matter if the twin soil OM is below 2%" };
            nextRecs = new[] { "Generate a new plan after adding zones", "Review Green Farm Score after the first irrigation" };
        }

        var payload = new Dictionary<string, object?>
        {
            ["planSections"] = new object[]
            {
                Section("overview", ur ? "فارم کا جائزہ" : "Farm overview", overview, overviewRecs),
                Section("crops", ur ? "فصل کی سفارشات" : "Crop recommendations", crops, cropRecs),
                Section("timeline", ur ? "موسمی شیڈول" : "Seasonal timeline", timeline, timelineRecs),
                Section("water", ur ? "پانی اور آبپاشی" : "Water and irrigation", water, waterRecs),
                Section("soil", ur ? "مٹی اور غذائیت" : "Soil and nutrition", soil, soilRecs),
                Section("recommendations", ur ? "اگلے اقدامات" : "Next actions", nextBody, nextRecs)
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

    private sealed record FarmContext(
        string? Crop,
        string? Region,
        string? AreaType,
        string? Soil,
        string Language,
        decimal? TempC = null,
        decimal? Humidity = null,
        decimal? RainfallMm = null,
        string? Condition = null)
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
            var tempC = ParseDecimal(First(blob, @"tempC=([0-9]+(?:\.[0-9]+)?)", null));
            var humidity = ParseDecimal(First(blob, @"humidity%?=([0-9]+(?:\.[0-9]+)?)", null));
            var rainfall = ParseDecimal(First(blob, @"rainfallMm=([0-9]+(?:\.[0-9]+)?)", null));
            var condition = First(blob, @"condition=([A-Za-z][A-Za-z \-]{1,40})", null);
            if (string.Equals(condition, "n/a", StringComparison.OrdinalIgnoreCase))
                condition = null;
            return new FarmContext(crop, region, area, soil, language, tempC, humidity, rainfall, condition);
        }

        private static decimal? ParseDecimal(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;
            return decimal.TryParse(raw, NumberStyles.Number, CultureInfo.InvariantCulture, out var value)
                ? value
                : null;
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
