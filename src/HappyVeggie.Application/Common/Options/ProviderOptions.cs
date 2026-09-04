namespace HappyVeggie.Application.Common.Options;

/// <summary>
/// Egress provider timeouts (GAP-073 / NFR-015). Bound from appsettings "Providers".
/// </summary>
public sealed class ProviderOptions
{
    public const string SectionName = "Providers";

    /// <summary>Per-call timeout for weather/soil (and similar) in RefreshTwin. Default 5s.</summary>
    public int TimeoutSeconds { get; set; } = 5;
}
