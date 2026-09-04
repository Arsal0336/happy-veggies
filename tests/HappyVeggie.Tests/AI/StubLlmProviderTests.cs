using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Infrastructure.Providers;

namespace HappyVeggie.Tests.AI;

public class StubLlmProviderTests
{
    private readonly StubLlmProvider _provider = new();

    [Fact]
    public async Task CompleteChatAsync_ReturnsStubResponse()
    {
        var messages = new List<LlmMessage>
        {
            new("system", "You are a farm assistant."),
            new("user", "What crops should I plant?")
        };

        var result = await _provider.CompleteChatAsync(messages, new LlmOptions(), CancellationToken.None);

        Assert.NotEmpty(result.Content);
        Assert.Equal("stub", result.Model);
        Assert.True(result.PromptTokens > 0);
        Assert.DoesNotContain("stub response", result.Content, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("advisory", result.Content, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CompleteJsonAsync_ReturnsValidPlanJson()
    {
        var messages = new List<LlmMessage>
        {
            new("system", "Generate plan JSON"),
            new("user", "Generate a plan")
        };

        var result = await _provider.CompleteJsonAsync("schema", messages, new LlmOptions(), CancellationToken.None);

        Assert.True(result.IsValid);
        Assert.Equal("stub", result.Model);
        Assert.Contains("planSections", result.RawJson);
        Assert.DoesNotContain("stub plan", result.RawJson, StringComparison.OrdinalIgnoreCase);

        // Validate with our schema validator
        var validation = HappyVeggie.Application.AI.Schemas.PlanJsonSchema.Validate(result.RawJson);
        Assert.True(validation.IsValid);
    }

    [Fact]
    public async Task CompleteChatAsync_IncludesDisclaimerInResponse()
    {
        var messages = new List<LlmMessage> { new("user", "Hello") };
        var result = await _provider.CompleteChatAsync(messages, new LlmOptions(), CancellationToken.None);
        Assert.Contains("not professional agricultural advice", result.Content, StringComparison.OrdinalIgnoreCase);
    }
}
