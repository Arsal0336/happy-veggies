using HappyVeggie.Application.AI.Prompts;

namespace HappyVeggie.Tests.AI;

public class PromptTemplateTests
{
    [Fact]
    public void AssistantSystem_ContainsLanguage()
    {
        var prompt = PromptTemplates.AssistantSystem("ur");
        Assert.Contains("ur", prompt);
    }

    [Fact]
    public void AssistantSystem_ContainsDisclaimer()
    {
        var prompt = PromptTemplates.AssistantSystem("en");
        Assert.Contains("AI-generated", prompt);
        Assert.Contains("not professional", prompt, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void AssistantSystem_ForbidsDataFabrication()
    {
        var prompt = PromptTemplates.AssistantSystem("en");
        Assert.Contains("never fabricate", prompt, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void AssistantSystem_ForbidsGreenScoreCertification()
    {
        var prompt = PromptTemplates.AssistantSystem("en");
        Assert.Contains("certif", prompt, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void PlanGenerationSystem_OutputsJsonOnly()
    {
        var prompt = PromptTemplates.PlanGenerationSystem("en");
        Assert.Contains("ONLY valid JSON", prompt);
    }

    [Fact]
    public void GreenTipSystem_NoChatter()
    {
        var prompt = PromptTemplates.GreenTipSystem("en");
        Assert.Contains("certification", prompt, StringComparison.OrdinalIgnoreCase);
    }
}
