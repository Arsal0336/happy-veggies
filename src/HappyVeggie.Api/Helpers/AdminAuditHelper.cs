using System.Text.Json;
using HappyVeggie.Application.Common.Interfaces;

namespace HappyVeggie.Api.Helpers;

/// <summary>
/// Controller-facing helper: encodes result / correlation / IP into MetadataJson
/// so AdminAuditLog schema stays unchanged while GET audit still returns them.
/// </summary>
public static class AdminAuditHelper
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
    };

    public static Task WriteFromHttpAsync(
        this IAdminAuditService audit,
        HttpContext http,
        Guid adminId,
        string action,
        string targetType,
        string? targetId,
        string? result = "success",
        object? extra = null,
        CancellationToken cancellationToken = default)
    {
        var correlationId = http.Request.Headers["X-Correlation-Id"].FirstOrDefault()
            ?? http.TraceIdentifier;
        var ip = http.Connection.RemoteIpAddress?.ToString();

        var envelope = new Dictionary<string, object?>
        {
            ["result"] = result,
            ["correlationId"] = correlationId,
            ["ipAddress"] = ip
        };

        if (extra is not null)
        {
            envelope["data"] = extra;
        }

        var metadataJson = JsonSerializer.Serialize(envelope, JsonOptions);
        return audit.WriteAsync(adminId, action, targetType, targetId, metadataJson, cancellationToken);
    }
}
