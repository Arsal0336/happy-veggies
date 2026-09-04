namespace HappyVeggie.Api.Middleware;

/// <summary>
/// Honors inbound X-Correlation-Id or uses TraceIdentifier; echoes on the response (GAP-071).
/// </summary>
public sealed class CorrelationIdMiddleware
{
    public const string HeaderName = "X-Correlation-Id";

    private readonly RequestDelegate _next;

    public CorrelationIdMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var incoming = context.Request.Headers[HeaderName].FirstOrDefault();
        var correlationId = string.IsNullOrWhiteSpace(incoming)
            ? context.TraceIdentifier
            : incoming.Trim();

        context.TraceIdentifier = correlationId;
        context.Response.OnStarting(() =>
        {
            context.Response.Headers[HeaderName] = correlationId;
            return Task.CompletedTask;
        });

        await _next(context);
    }
}
