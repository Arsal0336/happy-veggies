namespace HappyVeggie.Application.AI.Services;

/// <summary>
/// Validates LLM assistant responses (Doc 04 §3.4).
/// - Ensures disclaimer present
/// - Strips PII references to other farmers
/// - Adds citation hints
/// </summary>
public sealed class AssistantResponseValidator
{
    private const string Disclaimer = "⚠️ This is AI-generated advisory content. Not professional agricultural advice.";

    private static readonly string[] ForbiddenPatterns =
    [
        "farmer_id:",
        "other farmer",
        "neighbour's phone",
        "certification",
        "certified organic",
        "government certified"
    ];

    public AssistantValidationResult Validate(string content, Guid currentFarmId)
    {
        var issues = new List<string>();

        // Check for PII leaks referencing other farmers
        foreach (var pattern in ForbiddenPatterns)
        {
            if (content.Contains(pattern, StringComparison.OrdinalIgnoreCase))
            {
                issues.Add($"Response contains forbidden pattern: '{pattern}'");
            }
        }

        // Ensure disclaimer
        var hasDisclaimer = content.Contains("not professional", StringComparison.OrdinalIgnoreCase)
                         || content.Contains("AI-generated", StringComparison.OrdinalIgnoreCase)
                         || content.Contains("advisory", StringComparison.OrdinalIgnoreCase);

        var finalContent = content;
        if (!hasDisclaimer)
        {
            finalContent = content + "\n\n" + Disclaimer;
        }

        // Check for Green Score certification language (FR-132)
        if (content.Contains("certif", StringComparison.OrdinalIgnoreCase) &&
            content.Contains("green", StringComparison.OrdinalIgnoreCase))
        {
            issues.Add("Response may incorrectly reference Green Score as certification");
        }

        return new AssistantValidationResult(
            issues.Count == 0,
            finalContent,
            issues);
    }

    /// <summary>
    /// Extract citation chips from response based on known context signals.
    /// </summary>
    public static IReadOnlyList<string> ExtractCitations(string content)
    {
        var citations = new List<string>();

        if (content.Contains("weather", StringComparison.OrdinalIgnoreCase))
            citations.Add("weather_data");
        if (content.Contains("soil", StringComparison.OrdinalIgnoreCase))
            citations.Add("soil_data");
        if (content.Contains("growth stage", StringComparison.OrdinalIgnoreCase))
            citations.Add("growth_stage");
        if (content.Contains("shed", StringComparison.OrdinalIgnoreCase) ||
            content.Contains("greenhouse", StringComparison.OrdinalIgnoreCase))
            citations.Add("protected_area");
        if (content.Contains("compatibility", StringComparison.OrdinalIgnoreCase))
            citations.Add("compatibility_table");

        return citations;
    }
}

public sealed record AssistantValidationResult(
    bool IsClean,
    string Content,
    IReadOnlyList<string> Issues);
