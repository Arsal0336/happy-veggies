using System.Security.Claims;
using System.Threading.RateLimiting;
using HappyVeggie.Api.Contracts;
using HappyVeggie.Api.Options;
using Microsoft.AspNetCore.RateLimiting;

namespace HappyVeggie.Api.RateLimiting;

public static class RateLimitingExtensions
{
    public const string OtpPolicy = "otp";
    public const string PlanPolicy = "plan";
    public const string AssistantPolicy = "assistant";

    public static IServiceCollection AddHappyVeggieRateLimiting(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var section = configuration.GetSection(RateLimitingOptions.SectionName);
        services.Configure<RateLimitingOptions>(section);
        var opts = section.Get<RateLimitingOptions>() ?? new RateLimitingOptions();

        services.AddRateLimiter(limiter =>
        {
            limiter.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            limiter.OnRejected = WriteRateLimitedResponseAsync;

            limiter.AddPolicy(OtpPolicy, httpContext =>
                CreatePartition(httpContext, opts.Otp));

            limiter.AddPolicy(PlanPolicy, httpContext =>
                CreatePartition(httpContext, opts.Plan));

            limiter.AddPolicy(AssistantPolicy, httpContext =>
                CreatePartition(httpContext, opts.Assistant));
        });

        return services;
    }

    private static RateLimitPartition<string> CreatePartition(
        HttpContext httpContext,
        RateLimitPolicyOptions policy)
    {
        var key = ResolvePartitionKey(httpContext, policy.Partition);
        return RateLimitPartition.GetFixedWindowLimiter(
            key,
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = Math.Max(1, policy.PermitLimit),
                Window = TimeSpan.FromSeconds(Math.Max(1, policy.WindowSeconds)),
                QueueLimit = 0,
                AutoReplenishment = true
            });
    }

    private static string ResolvePartitionKey(HttpContext httpContext, string partition)
    {
        if (string.Equals(partition, "user", StringComparison.OrdinalIgnoreCase))
        {
            var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrWhiteSpace(userId))
                return $"user:{userId}";
        }

        var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return $"ip:{ip}";
    }

    private static async ValueTask WriteRateLimitedResponseAsync(
        OnRejectedContext context,
        CancellationToken cancellationToken)
    {
        var http = context.HttpContext;
        http.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        http.Response.ContentType = "application/json";

        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            http.Response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds).ToString();
        }

        var response = new ApiErrorResponse(
            "RATE_LIMITED",
            "Too many requests. Please retry after the rate limit window resets.",
            http.TraceIdentifier,
            Array.Empty<ApiValidationError>(),
            Retryable: true);

        await http.Response.WriteAsJsonAsync(response, cancellationToken);
    }
}
