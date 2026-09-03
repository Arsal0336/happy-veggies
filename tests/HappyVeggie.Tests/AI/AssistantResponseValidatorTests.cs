using HappyVeggie.Application.AI.Services;

namespace HappyVeggie.Tests.AI;

public class AssistantResponseValidatorTests
{
    private readonly AssistantResponseValidator _validator = new();
    private readonly Guid _farmId = Guid.NewGuid();

    [Fact]
    public void Validate_CleanResponse_ReturnsClean()
    {
        var result = _validator.Validate(
            "Based on your soil data, consider adding organic compost. This is AI-generated advisory content.",
            _farmId);
        Assert.True(result.IsClean);
    }

    [Fact]
    public void Validate_MissingDisclaimer_AppendsIt()
    {
        var result = _validator.Validate("Some advice without disclaimer.", _farmId);
        Assert.Contains("AI-generated", result.Content);
    }

    [Fact]
    public void Validate_ContainsForbiddenPattern_ReportsIssue()
    {
        var result = _validator.Validate(
            "The other farmer in your area grows wheat. This is advisory.",
            _farmId);
        Assert.False(result.IsClean);
        Assert.Contains(result.Issues, i => i.Contains("other farmer"));
    }

    [Fact]
    public void Validate_GreenCertificationLanguage_ReportsIssue()
    {
        var result = _validator.Validate(
            "Your green score means you are certified organic. This is advisory.",
            _farmId);
        Assert.False(result.IsClean);
        Assert.Contains(result.Issues, i => i.Contains("certification"));
    }

    [Fact]
    public void ExtractCitations_Weather_DetectsWeatherCitation()
    {
        var citations = AssistantResponseValidator.ExtractCitations(
            "Based on current weather conditions, temperature is 32°C.");
        Assert.Contains("weather_data", citations);
    }

    [Fact]
    public void ExtractCitations_ProtectedArea_DetectsProtectedAreaCitation()
    {
        var citations = AssistantResponseValidator.ExtractCitations(
            "In your greenhouse, humidity levels suggest...");
        Assert.Contains("protected_area", citations);
    }

    [Fact]
    public void ExtractCitations_Compatibility_DetectsCompatibilityCitation()
    {
        var citations = AssistantResponseValidator.ExtractCitations(
            "The compatibility table shows these crops work well together.");
        Assert.Contains("compatibility_table", citations);
    }
}
