using HappyVeggie.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Api.Controllers;

[ApiController]
[Route("api/v1/admin")]
[Authorize(Roles = "Admin")]
public sealed class AdminPortalController : ControllerBase
{
    private readonly IApplicationDbContext _db;

    public AdminPortalController(IApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics(CancellationToken cancellationToken)
    {
        var farmerCount = await _db.Farmers.CountAsync(cancellationToken);
        var farmCount = await _db.Farms.CountAsync(f => !f.IsDeleted, cancellationToken);
        var planCount = await _db.FarmPlans.CountAsync(cancellationToken);
        var activeThreads = await _db.AssistantThreads.CountAsync(t => !t.IsArchived, cancellationToken);

        return Ok(new { Farmers = farmerCount, Farms = farmCount, Plans = planCount, ActiveThreads = activeThreads });
    }

    [HttpGet("farmers")]
    public async Task<IActionResult> SearchFarmers([FromQuery] string? q, CancellationToken cancellationToken)
    {
        var query = _db.Farmers.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(q))
        {
            query = query.Where(f => f.Phone.Contains(q) || (f.Name != null && f.Name.Contains(q)));
        }

        var farmers = await query
            .OrderByDescending(f => f.CreatedAt)
            .Take(50)
            .Select(f => new { f.Id, f.Phone, f.Name, f.Language, f.CreatedAt })
            .ToListAsync(cancellationToken);

        return Ok(farmers);
    }

    [HttpGet("farmers/{id:guid}")]
    public async Task<IActionResult> GetFarmer(Guid id, CancellationToken cancellationToken)
    {
        var farmer = await _db.Farmers.AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"Farmer {id} not found.");

        var farms = await _db.Farms.AsNoTracking()
            .Where(f => f.FarmerId == id && !f.IsDeleted)
            .Select(f => new { f.Id, f.Name, f.RegionLabel, f.AreaAcres, f.CreatedAt })
            .ToListAsync(cancellationToken);

        return Ok(new { Farmer = new { farmer.Id, farmer.Phone, farmer.Name, farmer.Language, farmer.CreatedAt }, Farms = farms });
    }

    [HttpGet("crops")]
    public async Task<IActionResult> ListCrops(CancellationToken cancellationToken)
    {
        var crops = await _db.Crops.AsNoTracking()
            .OrderBy(c => c.NameEn)
            .ToListAsync(cancellationToken);
        return Ok(crops);
    }

    [HttpGet("seed-varieties")]
    public async Task<IActionResult> ListSeedVarieties(CancellationToken cancellationToken)
    {
        var varieties = await _db.SeedVarieties.AsNoTracking()
            .OrderBy(v => v.CropId).ThenBy(v => v.NameEn)
            .ToListAsync(cancellationToken);
        return Ok(varieties);
    }

    [HttpGet("compatibility")]
    public async Task<IActionResult> ListCompatibility(CancellationToken cancellationToken)
    {
        var entries = await _db.CropCompatibility.AsNoTracking()
            .ToListAsync(cancellationToken);
        return Ok(entries);
    }

    [HttpGet("production-area-types")]
    public async Task<IActionResult> ListProductionAreaTypes(CancellationToken cancellationToken)
    {
        var types = await _db.ProductionAreaTypes.AsNoTracking()
            .OrderBy(t => t.Code)
            .ToListAsync(cancellationToken);
        return Ok(types);
    }

    [HttpGet("plans")]
    public async Task<IActionResult> ListPlans([FromQuery] bool? flagged, CancellationToken cancellationToken)
    {
        var query = _db.FarmPlans.AsNoTracking();
        // Flagged plan filtering — placeholder (flagging mechanism TBD)
        var plans = await query
            .OrderByDescending(p => p.CreatedAt)
            .Take(50)
            .Select(p => new { p.Id, p.FarmId, p.FarmerId, p.Version, p.Language, p.CreatedAt })
            .ToListAsync(cancellationToken);
        return Ok(plans);
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs(CancellationToken cancellationToken)
    {
        var logs = await _db.AdminAuditLogs.AsNoTracking()
            .OrderByDescending(l => l.Timestamp)
            .Take(100)
            .ToListAsync(cancellationToken);
        return Ok(logs);
    }
}
