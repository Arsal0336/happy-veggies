using HappyVeggie.Application.AI.Schemas;

namespace HappyVeggie.Tests.AI;

public class PlanJsonSchemaTests
{
    [Fact]
    public void Validate_ValidJson_ReturnsValid()
    {
        var json = """
        {
            "planSections": [
                { "sectionId": "overview", "title": "Overview", "content": "Some content" }
            ],
            "language": "en",
            "disclaimer": "Not advice",
            "generatedAt": "2026-01-01T00:00:00Z"
        }
        """;

        var result = PlanJsonSchema.Validate(json);
        Assert.True(result.IsValid);
        Assert.Null(result.Error);
    }

    [Fact]
    public void Validate_EmptySections_ReturnsInvalid()
    {
        var json = """
        {
            "planSections": [],
            "language": "en",
            "disclaimer": "Not advice",
            "generatedAt": "2026-01-01T00:00:00Z"
        }
        """;

        var result = PlanJsonSchema.Validate(json);
        Assert.False(result.IsValid);
        Assert.Contains("empty", result.Error);
    }

    [Fact]
    public void Validate_MissingLanguage_ReturnsInvalid()
    {
        var json = """
        {
            "planSections": [
                { "sectionId": "overview", "title": "Overview", "content": "Content" }
            ],
            "disclaimer": "Not advice"
        }
        """;

        var result = PlanJsonSchema.Validate(json);
        Assert.False(result.IsValid);
        Assert.Contains("language", result.Error);
    }

    [Fact]
    public void Validate_MalformedJson_ReturnsInvalid()
    {
        var result = PlanJsonSchema.Validate("not json at all");
        Assert.False(result.IsValid);
        Assert.Contains("Invalid JSON", result.Error);
    }

    [Fact]
    public void Validate_MissingDisclaimer_ReturnsInvalid()
    {
        var json = """
        {
            "planSections": [
                { "sectionId": "overview", "title": "Overview", "content": "Content" }
            ],
            "language": "en"
        }
        """;

        var result = PlanJsonSchema.Validate(json);
        Assert.False(result.IsValid);
        Assert.Contains("disclaimer", result.Error);
    }
}
