using HappyVeggie.Application.Alerts;
using HappyVeggie.Application.Alerts.GetFarmAlerts;
using HappyVeggie.Application.Alerts.MarkAlertRead;
using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.GreenScore;
using HappyVeggie.Application.DigitalTwin.Dtos;
using HappyVeggie.Application.DigitalTwin.GetFarmTwin;
using HappyVeggie.Application.DigitalTwin.RefreshTwin;
using HappyVeggie.Application.AI.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Api.Controllers;

[ApiController]
[Route("api/v1/farms/{farmId:guid}")]
[Authorize(Roles = "Farmer")]
public sealed class FarmTwinController : ControllerBase
{
    private readonly ISender _sender;
    private readonly GreenFarmScoringService _greenScore;
    private readonly FarmOwnershipGuard _ownershipGuard;
    private readonly GreenTipService _greenTipService;
    private readonly IApplicationDbContext _db;
    private readonly AlertEvaluationService _alertEvaluation;

    public FarmTwinController(
        ISender sender,
        GreenFarmScoringService greenScore,
        FarmOwnershipGuard ownershipGuard,
        GreenTipService greenTipService,
        IApplicationDbContext db,
        AlertEvaluationService alertEvaluation)
    {
        _sender = sender;
        _greenScore = greenScore;
        _ownershipGuard = ownershipGuard;
        _greenTipService = greenTipService;
        _db = db;
        _alertEvaluation = alertEvaluation;
    }

    [HttpGet("twin")]
    public async Task<ActionResult<FarmTwinDto>> GetTwin(Guid farmId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetFarmTwinQuery(farmId), cancellationToken);
        return Ok(result);
    }

    [HttpPost("twin/refresh")]
    public async Task<ActionResult<FarmTwinDto>> RefreshTwin(Guid farmId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new RefreshTwinCommand(farmId), cancellationToken);
        return Ok(result);
    }

    [HttpGet("alerts")]
    public async Task<ActionResult<IReadOnlyList<FarmAlertDto>>> GetAlerts(Guid farmId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetFarmAlertsQuery(farmId), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Dedicated alert evaluation (GAP-050). Also runs on twin refresh.
    /// Cadence for scheduled runs is TBD-10.
    /// </summary>
    [HttpPost("alerts/evaluate")]
    public async Task<ActionResult<IReadOnlyList<FarmAlertDto>>> EvaluateAlerts(
        Guid farmId, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(farmId, cancellationToken);

        var snapshot = await _db.TwinSnapshots.AsNoTracking()
            .FirstOrDefaultAsync(t => t.FarmId == farmId, cancellationToken);

        decimal? temperatureC = null;
        if (snapshot?.TwinJson is { Length: > 0 } json)
        {
            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(json);
                if (doc.RootElement.TryGetProperty("weather", out var weather)
                    && weather.TryGetProperty("temperatureC", out var temp)
                    && temp.ValueKind == System.Text.Json.JsonValueKind.Number)
                {
                    temperatureC = temp.GetDecimal();
                }
            }
            catch
            {
                // Ignore malformed twin JSON for evaluation.
            }
        }

        await _alertEvaluation.EvaluateAfterTwinRefreshAsync(
            farmId, snapshot?.WeatherProviderStatus, temperatureC, cancellationToken);

        var result = await _sender.Send(new GetFarmAlertsQuery(farmId), cancellationToken);
        return Ok(result);
    }

    [HttpPatch("alerts/{alertId:guid}/read")]
    public async Task<IActionResult> MarkAlertRead(
        Guid farmId, Guid alertId, CancellationToken cancellationToken)
    {
        await _sender.Send(new MarkAlertReadCommand(farmId, alertId), cancellationToken);
        return NoContent();
    }

    [HttpGet("green-score")]
    public async Task<ActionResult<GreenScoreResult>> GetGreenScore(Guid farmId, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(farmId, cancellationToken);
        var result = await _greenScore.CalculateAsync(farmId, cancellationToken);
        return Ok(result);
    }

    [HttpPost("green-score/recalculate")]
    public async Task<ActionResult<GreenScoreResult>> RecalculateGreenScore(Guid farmId, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(farmId, cancellationToken);
        var result = await _greenScore.CalculateAsync(farmId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("green-tips")]
    public async Task<ActionResult<GreenTipResult>> GetGreenTips(Guid farmId, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(farmId, cancellationToken);
        var farmForTips = await _db.Farms.AsNoTracking()
            .FirstAsync(f => f.Id == farmId, cancellationToken);
        var farmerForTips = await _db.Farmers.AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == farmForTips.FarmerId, cancellationToken);
        var result = await _greenTipService.GenerateTipsAsync(farmId, farmerForTips?.Language ?? "en", cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Portfolio optimizer — BLOCKED (GAP-054 / TBD-11). Algorithm not defined.
    /// </summary>
    [HttpGet("portfolio")]
    public IActionResult GetPortfolio(Guid farmId)
    {
        return Ok(new
        {
            status = "blocked",
            reason = "GAP-054 algorithm TBD (GAP-003 TBD-11)",
            httpHint = 501
        });
    }
}
