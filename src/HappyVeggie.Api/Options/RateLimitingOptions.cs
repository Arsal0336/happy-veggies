namespace HappyVeggie.Api.Options;

/// <summary>
/// Fixed-window rate limits (GAP-070 / NFR-019). Bound from appsettings "RateLimiting".
/// </summary>
public sealed class RateLimitingOptions
{
    public const string SectionName = "RateLimiting";

    public RateLimitPolicyOptions Otp { get; set; } = new()
    {
        PermitLimit = 5,
        WindowSeconds = 60,
        Partition = "ip"
    };

    public RateLimitPolicyOptions Plan { get; set; } = new()
    {
        PermitLimit = 10,
        WindowSeconds = 3600,
        Partition = "user"
    };

    public RateLimitPolicyOptions Assistant { get; set; } = new()
    {
        PermitLimit = 30,
        WindowSeconds = 60,
        Partition = "user"
    };
}

public sealed class RateLimitPolicyOptions
{
    public int PermitLimit { get; set; }
    public int WindowSeconds { get; set; }
    /// <summary>"ip" or "user" (authenticated NameIdentifier / anonymous falls back to IP).</summary>
    public string Partition { get; set; } = "ip";
}
