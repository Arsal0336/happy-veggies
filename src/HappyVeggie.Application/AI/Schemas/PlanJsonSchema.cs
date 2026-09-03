namespace HappyVeggie.Application.AI.Schemas;

/// <summary>
/// Plan JSON schema definition (Doc 04 §5.1).
/// Versioned; used for LLM JSON-mode completion and validation.
/// </summary>
public static class PlanJsonSchema
{
    public const string Version = "1.0";

    public const string Schema = """
    {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "required": ["planSections", "language", "disclaimer", "generatedAt"],
        "properties": {
            "planSections": {
                "type": "array",
                "minItems": 1,
                "items": {
                    "type": "object",
                    "required": ["sectionId", "title", "content"],
                    "properties": {
                        "sectionId": {
                            "type": "string",
                            "enum": ["overview", "crops", "timeline", "economics", "compatibility", "water", "soil", "experimental", "recommendations"]
                        },
                        "title": { "type": "string", "maxLength": 200 },
                        "content": { "type": "string", "maxLength": 5000 },
                        "recommendations": {
                            "type": "array",
                            "items": { "type": "string", "maxLength": 500 },
                            "maxItems": 10
                        }
                    }
                }
            },
            "language": { "type": "string", "maxLength": 5 },
            "disclaimer": { "type": "string" },
            "generatedAt": { "type": "string", "format": "date-time" }
        }
    }
    """;

    /// <summary>
    /// Validate plan JSON has required sections and structure.
    /// </summary>
    public static PlanValidationResult Validate(string json)
    {
        try
        {
            using var doc = global::System.Text.Json.JsonDocument.Parse(json);
            var root = doc.RootElement;

            if (!root.TryGetProperty("planSections", out var sections) || sections.GetArrayLength() == 0)
                return new PlanValidationResult(false, "Missing or empty planSections");

            if (!root.TryGetProperty("language", out _))
                return new PlanValidationResult(false, "Missing language field");

            if (!root.TryGetProperty("disclaimer", out _))
                return new PlanValidationResult(false, "Missing disclaimer field");

            return new PlanValidationResult(true, null);
        }
        catch (global::System.Text.Json.JsonException ex)
        {
            return new PlanValidationResult(false, $"Invalid JSON: {ex.Message}");
        }
    }
}

public sealed record PlanValidationResult(bool IsValid, string? Error);
