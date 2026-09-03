using System.Security.Claims;
using HappyVeggie.Application.AI.Services;
using HappyVeggie.Application.Alerts.GetFarmAlerts;
using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.DigitalTwin.Dtos;
using HappyVeggie.Application.GreenScore;
using Microsoft.EntityFrameworkCore;
using HappyVeggie.Application.DigitalTwin.GetFarmTwin;
using HappyVeggie.Application.DigitalTwin.RefreshTwin;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

    public FarmTwinController(
        ISender sender, GreenFarmScoringService greenScore,
        FarmOwnershipGuard ownershipGuard, GreenTipService greenTipService,
        IApplicationDbContext db)
    {
        _sender = sender;
        _greenScore = greenScore;
        _ownershipGuard = ownershipGuard;
        _greenTipService = greenTipService;
        _db = db;
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
}
