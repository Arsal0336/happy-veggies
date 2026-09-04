using System.Text.Json;
using System.Text.RegularExpressions;

namespace HappyVeggie.Application.AI.Services;

/// <summary>
/// Extracts and strips the <<<FOLLOW_UPS>>> trailer from assistant replies.
/// </summary>
public static partial class FollowUpQuestionsParser
{
    private static readonly Regex TrailerRegex = FollowUpsTrailerRegex();

    public static (string Content, IReadOnlyList<string> FollowUps) Extract(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return (content ?? string.Empty, Array.Empty<string>());
        }

        var match = TrailerRegex.Match(content);
        if (!match.Success)
        {
            return (content.Trim(), Array.Empty<string>());
        }

        var cleaned = TrailerRegex.Replace(content, string.Empty).Trim();
        var json = match.Groups[1].Value.Trim();
        var followUps = ParseJsonArray(json);
        return (cleaned, followUps);
    }

    public static IReadOnlyList<string> ParseJsonArray(string json)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.ValueKind != JsonValueKind.Array)
            {
                return Array.Empty<string>();
            }

            return doc.RootElement
                .EnumerateArray()
                .Select(e => e.GetString()?.Trim())
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Cast<string>()
                .Take(4)
                .ToList();
        }
        catch (JsonException)
        {
            return Array.Empty<string>();
        }
    }

    [GeneratedRegex(
        @"<<<FOLLOW_UPS>>>\s*(\[[\s\S]*?\])\s*<<<END_FOLLOW_UPS>>>",
        RegexOptions.IgnoreCase | RegexOptions.CultureInvariant)]
    private static partial Regex FollowUpsTrailerRegex();
}
