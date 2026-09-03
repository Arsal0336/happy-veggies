using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Api.Controllers;

[ApiController]
[Route("api/v1/farms/{farmId:guid}/experimental")]
[Authorize(Roles = "Farmer")]
public sealed class ExperimentalController : ControllerBase
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public ExperimentalController(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    /// <summary>
    /// Get experimental zones for a farm.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetExperimentalStatus(Guid farmId, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(farmId, cancellationToken);

        var experimentalZones = await _db.CropZones
            .AsNoTracking()
            .Where(z => z.FarmId == farmId && z.IsExperimental && !z.IsDeleted)
            .Select(z => new
            {
                z.Id,
                z.Label,
                z.CropId,
                z.CropFreetext,
                z.SeedVarietyId,
                z.PlantingDate,
                z.GrowthStage,
                z.AreaInputValue,
                z.AreaInputUnit
            })
            .ToListAsync(cancellationToken);

        var experimentalAreas = await _db.ProductionAreas
            .AsNoTracking()
            .Where(a => a.FarmId == farmId && a.TypeCode == "experimental" && !a.IsDeleted)
            .Select(a => new { a.Id, a.Name, a.AreaInputValue, a.AreaInputUnit })
            .ToListAsync(cancellationToken);

        return Ok(new { ExperimentalAreas = experimentalAreas, ExperimentalZones = experimentalZones });
    }

    /// <summary>
    /// Approve an experimental plan (marks zone as approved for tracking).
    /// </summary>
    [HttpPost("zones/{zoneId:guid}/approve")]
    public async Task<IActionResult> ApproveExperimental(
        Guid farmId, Guid zoneId, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(farmId, cancellationToken);

        var zone = await _db.CropZones
            .FirstOrDefaultAsync(z => z.Id == zoneId && z.FarmId == farmId && z.IsExperimental && !z.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException($"Experimental zone {zoneId} not found.");

        // Mark as approved by setting growth stage
        zone.GrowthStage = "approved_experimental";
        zone.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        return Ok(new { zone.Id, Status = "approved" });
    }
}
