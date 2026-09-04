using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HappyVeggie.Application.Alerts;

/// <summary>
/// Minimal alert rules evaluated after twin refresh (GAP-050).
/// Cadence for scheduled evaluation is TBD-10 — currently refresh-driven only.
/// </summary>
public sealed class AlertEvaluationService
{
    /// <summary>Stub/live high-temp advisory threshold (°C). Product may revise.</summary>
    public const decimal HeatAdvisoryThresholdC = 32m;

    private readonly IApplicationDbContext _db;
    private readonly ILogger<AlertEvaluationService> _logger;

    public AlertEvaluationService(IApplicationDbContext db, ILogger<AlertEvaluationService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task EvaluateAfterTwinRefreshAsync(
        Guid farmId,
        string? weatherStatus,
        decimal? temperatureC,
        CancellationToken cancellationToken)
    {
        try
        {
            await EvaluateCoreAsync(farmId, weatherStatus, temperatureC, cancellationToken);
        }
        catch (Exception ex)
        {
            // FR-095: alert evaluation failures must never block twin refresh.
            _logger.LogWarning(ex, "Alert evaluation failed for farm {FarmId}; twin refresh continues.", farmId);
        }
    }

    public async Task EvaluateCoreAsync(
        Guid farmId,
        string? weatherStatus,
        decimal? temperatureC,
        CancellationToken cancellationToken)
    {
        if (string.Equals(weatherStatus, "failed", StringComparison.OrdinalIgnoreCase))
        {
            await EnsureUnreadAlertAsync(
                farmId,
                type: "weather_advisory",
                severity: "warning",
                title: "Weather data unavailable",
                body: "Weather enrichment failed for this farm. Planning continues with last known twin data.",
                sourceSignal: "weather_failed",
                cancellationToken);
        }

        if (temperatureC is >= HeatAdvisoryThresholdC)
        {
            await EnsureUnreadAlertAsync(
                farmId,
                type: "heat_advisory",
                severity: "warning",
                title: "Heat advisory",
                body: $"Temperature {temperatureC:F1}°C meets or exceeds the heat advisory threshold ({HeatAdvisoryThresholdC}°C).",
                sourceSignal: "heat_high_temp",
                cancellationToken);
        }

        await _db.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureUnreadAlertAsync(
        Guid farmId,
        string type,
        string severity,
        string title,
        string body,
        string sourceSignal,
        CancellationToken cancellationToken)
    {
        var exists = await _db.Alerts.AnyAsync(
            a => a.FarmId == farmId
                 && a.SourceSignal == sourceSignal
                 && !a.IsRead,
            cancellationToken);

        if (exists)
            return;

        _db.Alerts.Add(new Alert
        {
            Id = Guid.NewGuid(),
            FarmId = farmId,
            Type = type,
            Severity = severity,
            Title = title,
            Body = body,
            IsRead = false,
            CreatedAt = DateTimeOffset.UtcNow,
            SourceSignal = sourceSignal
        });
    }
}
