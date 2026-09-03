using HappyVeggie.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace HappyVeggie.Application.AI.Services;

/// <summary>
/// Logs LLM usage for admin cost visibility (NFR-007). No secrets in logs.
/// </summary>
public sealed class LlmUsageLogger
{
    private readonly ILogger<LlmUsageLogger> _logger;

    public LlmUsageLogger(ILogger<LlmUsageLogger> logger)
    {
        _logger = logger;
    }

    public void LogChatUsage(string requestType, LlmChatResponse response, Guid? farmerId = null)
    {
        _logger.LogInformation(
            "LLM Chat | Type={RequestType} Model={Model} PromptTokens={PromptTokens} CompletionTokens={CompletionTokens} Latency={LatencyMs}ms FarmerId={FarmerId}",
            requestType, response.Model, response.PromptTokens, response.CompletionTokens,
            response.Latency.TotalMilliseconds, farmerId);
    }

    public void LogJsonUsage(string requestType, LlmJsonResponse response, Guid? farmerId = null)
    {
        _logger.LogInformation(
            "LLM JSON | Type={RequestType} Model={Model} PromptTokens={PromptTokens} CompletionTokens={CompletionTokens} Valid={IsValid} Latency={LatencyMs}ms FarmerId={FarmerId}",
            requestType, response.Model, response.PromptTokens, response.CompletionTokens,
            response.IsValid, response.Latency.TotalMilliseconds, farmerId);
    }
}
