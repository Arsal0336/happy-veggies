using System.Security.Claims;
using HappyVeggie.Api.Helpers;
using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.DigitalTwin.Services;
using HappyVeggie.Domain.Entities;
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
    private readonly IAdminAuditService _audit;
    private readonly DigitalTwinAssembler _twinAssembler;

    public AdminPortalController(
        IApplicationDbContext db,
        IAdminAuditService audit,
        DigitalTwinAssembler twinAssembler)
    {
        _db = db;
        _audit = audit;
        _twinAssembler = twinAssembler;
    }

    private Guid GetAdminId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics(CancellationToken cancellationToken)
    {
        var farmerCount = await _db.Farmers.CountAsync(cancellationToken);
        var farmCount = await _db.Farms.CountAsync(f => !f.IsDeleted, cancellationToken);
        var planCount = await _db.FarmPlans.CountAsync(cancellationToken);
        var activeThreads = await _db.AssistantThreads.CountAsync(t => !t.IsArchived, cancellationToken);

        return Ok(new { Farmers = farmerCount, Farms = farmCount, Plans = planCount, ActiveThreads = activeThreads });
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics(CancellationToken cancellationToken)
    {
        var farmers = await _db.Farmers.CountAsync(cancellationToken);
        var farms = await _db.Farms.CountAsync(f => !f.IsDeleted, cancellationToken);
        var plans = await _db.FarmPlans.CountAsync(cancellationToken);
        var threads = await _db.AssistantThreads.CountAsync(t => !t.IsArchived, cancellationToken);
        var llmUsageCount = await _db.LlmUsageLogs.CountAsync(cancellationToken);
        var estimatedCostUsd = await _db.LlmUsageLogs
            .SumAsync(l => (decimal?)l.EstimatedCostUsd, cancellationToken) ?? 0m;

        return Ok(new
        {
            Farmers = farmers,
            Farms = farms,
            Plans = plans,
            Threads = threads,
            LlmUsageCount = llmUsageCount,
            EstimatedCostUsd = estimatedCostUsd
        });
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
            .Select(f => new { f.Id, f.Phone, f.Name, f.Language, f.CreatedAt })
            .ToListAsync(cancellationToken);

        // SQLite cannot ORDER BY DateTimeOffset — sort in memory.
        return Ok(farmers.OrderByDescending(f => f.CreatedAt).Take(50).ToList());
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

    [HttpGet("farms/{farmId:guid}/twin")]
    public async Task<IActionResult> GetFarmTwin(Guid farmId, CancellationToken cancellationToken)
    {
        var twin = await _twinAssembler.AssembleAsync(farmId, cancellationToken);

        await _audit.WriteFromHttpAsync(
            HttpContext,
            GetAdminId(),
            "farm.twin_inspect",
            nameof(Farm),
            farmId.ToString(),
            result: "success",
            cancellationToken: cancellationToken);

        return Ok(twin);
    }

    // ── Catalog: crops ──────────────────────────────────────────────────────

    [HttpGet("crops")]
    public async Task<IActionResult> ListCrops(CancellationToken cancellationToken)
    {
        var crops = await _db.Crops.AsNoTracking()
            .OrderBy(c => c.NameEn)
            .ToListAsync(cancellationToken);
        return Ok(crops);
    }

    [HttpPost("crops")]
    public async Task<IActionResult> CreateCrop(
        [FromBody] CreateCropRequest body,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(body.Id) || string.IsNullOrWhiteSpace(body.NameEn))
            return BadRequest(new { error = "id and nameEn are required." });

        var id = body.Id.Trim().ToLowerInvariant();
        if (await _db.Crops.AnyAsync(c => c.Id == id, cancellationToken))
            return Conflict(new { error = $"Crop '{id}' already exists." });

        var crop = new Crop
        {
            Id = id,
            NameEn = body.NameEn.Trim(),
            NameUr = string.IsNullOrWhiteSpace(body.NameUr) ? body.NameEn.Trim() : body.NameUr.Trim(),
            IconUrl = body.IconUrl,
            Enabled = body.Enabled ?? true
        };

        _db.Crops.Add(crop);
        await _db.SaveChangesAsync(cancellationToken);

        await _audit.WriteFromHttpAsync(
            HttpContext, GetAdminId(), "crop.create", nameof(Crop), crop.Id,
            result: "success", extra: new { crop.NameEn, crop.Enabled },
            cancellationToken: cancellationToken);

        return Created($"api/v1/admin/crops/{crop.Id}", crop);
    }

    [HttpPatch("crops/{id}")]
    public async Task<IActionResult> UpdateCrop(
        string id,
        [FromBody] UpdateCropRequest body,
        CancellationToken cancellationToken)
    {
        var crop = await _db.Crops.FirstOrDefaultAsync(c => c.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"Crop {id} not found.");

        if (body.NameEn is not null) crop.NameEn = body.NameEn.Trim();
        if (body.NameUr is not null) crop.NameUr = body.NameUr.Trim();
        if (body.IconUrl is not null) crop.IconUrl = body.IconUrl;
        if (body.Enabled.HasValue) crop.Enabled = body.Enabled.Value;

        await _db.SaveChangesAsync(cancellationToken);

        await _audit.WriteFromHttpAsync(
            HttpContext, GetAdminId(), "crop.update", nameof(Crop), crop.Id,
            result: "success", extra: new { crop.NameEn, crop.Enabled },
            cancellationToken: cancellationToken);

        return Ok(crop);
    }

    // ── Catalog: seed varieties ─────────────────────────────────────────────

    [HttpGet("seed-varieties")]
    public async Task<IActionResult> ListSeedVarieties(CancellationToken cancellationToken)
    {
        var varieties = await _db.SeedVarieties.AsNoTracking()
            .OrderBy(v => v.CropId).ThenBy(v => v.NameEn)
            .ToListAsync(cancellationToken);
        return Ok(varieties);
    }

    [HttpPost("seed-varieties")]
    public async Task<IActionResult> CreateSeedVariety(
        [FromBody] CreateSeedVarietyRequest body,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(body.Id) || string.IsNullOrWhiteSpace(body.CropId) ||
            string.IsNullOrWhiteSpace(body.NameEn))
            return BadRequest(new { error = "id, cropId, and nameEn are required." });

        var id = body.Id.Trim().ToLowerInvariant();
        if (await _db.SeedVarieties.AnyAsync(v => v.Id == id, cancellationToken))
            return Conflict(new { error = $"Seed variety '{id}' already exists." });

        if (!await _db.Crops.AnyAsync(c => c.Id == body.CropId, cancellationToken))
            return BadRequest(new { error = $"Crop '{body.CropId}' not found." });

        var variety = new SeedVariety
        {
            Id = id,
            CropId = body.CropId.Trim(),
            NameEn = body.NameEn.Trim(),
            NameUr = string.IsNullOrWhiteSpace(body.NameUr) ? body.NameEn.Trim() : body.NameUr.Trim(),
            VarietyType = body.VarietyType ?? SeedVarietyType.Other,
            Enabled = body.Enabled ?? true,
            MaturityDays = body.MaturityDays,
            RiskBand = body.RiskBand
        };

        _db.SeedVarieties.Add(variety);
        await _db.SaveChangesAsync(cancellationToken);

        await _audit.WriteFromHttpAsync(
            HttpContext, GetAdminId(), "seed_variety.create", nameof(SeedVariety), variety.Id,
            result: "success", extra: new { variety.CropId, variety.NameEn, variety.Enabled },
            cancellationToken: cancellationToken);

        return Created($"api/v1/admin/seed-varieties/{variety.Id}", variety);
    }

    [HttpPatch("seed-varieties/{id}")]
    public async Task<IActionResult> UpdateSeedVariety(
        string id,
        [FromBody] UpdateSeedVarietyRequest body,
        CancellationToken cancellationToken)
    {
        var variety = await _db.SeedVarieties.FirstOrDefaultAsync(v => v.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"Seed variety {id} not found.");

        if (body.NameEn is not null) variety.NameEn = body.NameEn.Trim();
        if (body.NameUr is not null) variety.NameUr = body.NameUr.Trim();
        if (body.CropId is not null) variety.CropId = body.CropId.Trim();
        if (body.VarietyType.HasValue) variety.VarietyType = body.VarietyType.Value;
        if (body.Enabled.HasValue) variety.Enabled = body.Enabled.Value;
        if (body.MaturityDays.HasValue) variety.MaturityDays = body.MaturityDays;
        if (body.RiskBand.HasValue) variety.RiskBand = body.RiskBand;

        await _db.SaveChangesAsync(cancellationToken);

        await _audit.WriteFromHttpAsync(
            HttpContext, GetAdminId(), "seed_variety.update", nameof(SeedVariety), variety.Id,
            result: "success", extra: new { variety.NameEn, variety.Enabled },
            cancellationToken: cancellationToken);

        return Ok(variety);
    }

    // ── Catalog: production area types ──────────────────────────────────────

    [HttpGet("production-area-types")]
    public async Task<IActionResult> ListProductionAreaTypes(CancellationToken cancellationToken)
    {
        var types = await _db.ProductionAreaTypes.AsNoTracking()
            .OrderBy(t => t.Code)
            .ToListAsync(cancellationToken);
        return Ok(types);
    }

    [HttpPost("production-area-types")]
    public async Task<IActionResult> CreateProductionAreaType(
        [FromBody] CreateProductionAreaTypeRequest body,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(body.Code) || string.IsNullOrWhiteSpace(body.NameEn))
            return BadRequest(new { error = "code and nameEn are required." });

        var code = body.Code.Trim().ToLowerInvariant();
        if (await _db.ProductionAreaTypes.AnyAsync(t => t.Code == code, cancellationToken))
            return Conflict(new { error = $"Production area type '{code}' already exists." });

        var type = new ProductionAreaType
        {
            Code = code,
            NameEn = body.NameEn.Trim(),
            NameUr = string.IsNullOrWhiteSpace(body.NameUr) ? body.NameEn.Trim() : body.NameUr.Trim(),
            Category = body.Category ?? ProductionAreaTypeCategory.Open,
            Enabled = body.Enabled ?? true
        };

        _db.ProductionAreaTypes.Add(type);
        await _db.SaveChangesAsync(cancellationToken);

        await _audit.WriteFromHttpAsync(
            HttpContext, GetAdminId(), "production_area_type.create", nameof(ProductionAreaType), type.Code,
            result: "success", extra: new { type.NameEn, type.Category, type.Enabled },
            cancellationToken: cancellationToken);

        return Created($"api/v1/admin/production-area-types/{type.Code}", type);
    }

    [HttpPatch("production-area-types/{code}")]
    public async Task<IActionResult> UpdateProductionAreaType(
        string code,
        [FromBody] UpdateProductionAreaTypeRequest body,
        CancellationToken cancellationToken)
    {
        var type = await _db.ProductionAreaTypes.FirstOrDefaultAsync(t => t.Code == code, cancellationToken)
            ?? throw new KeyNotFoundException($"Production area type {code} not found.");

        if (body.NameEn is not null) type.NameEn = body.NameEn.Trim();
        if (body.NameUr is not null) type.NameUr = body.NameUr.Trim();
        if (body.Category.HasValue) type.Category = body.Category.Value;
        if (body.Enabled.HasValue) type.Enabled = body.Enabled.Value;

        await _db.SaveChangesAsync(cancellationToken);

        await _audit.WriteFromHttpAsync(
            HttpContext, GetAdminId(), "production_area_type.update", nameof(ProductionAreaType), type.Code,
            result: "success", extra: new { type.NameEn, type.Enabled },
            cancellationToken: cancellationToken);

        return Ok(type);
    }

    // ── Catalog: compatibility ──────────────────────────────────────────────

    [HttpGet("compatibility")]
    public async Task<IActionResult> ListCompatibility(CancellationToken cancellationToken)
    {
        var entries = await _db.CropCompatibility.AsNoTracking()
            .ToListAsync(cancellationToken);
        return Ok(entries);
    }

    [HttpPut("compatibility")]
    [HttpPatch("compatibility")]
    public async Task<IActionResult> UpsertCompatibility(
        [FromBody] UpsertCompatibilityRequest body,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(body.CropAId) || string.IsNullOrWhiteSpace(body.CropBId))
            return BadRequest(new { error = "cropAId and cropBId are required." });

        var scope = body.Scope ?? CropCompatibilityScope.General;
        var cropA = body.CropAId.Trim();
        var cropB = body.CropBId.Trim();

        CropCompatibility? entry = null;
        if (body.Id.HasValue)
        {
            entry = await _db.CropCompatibility.FirstOrDefaultAsync(c => c.Id == body.Id.Value, cancellationToken);
        }

        entry ??= await _db.CropCompatibility.FirstOrDefaultAsync(
            c => c.CropAId == cropA && c.CropBId == cropB && c.Scope == scope,
            cancellationToken);

        var created = entry is null;
        if (entry is null)
        {
            entry = new CropCompatibility
            {
                Id = Guid.NewGuid(),
                CropAId = cropA,
                CropBId = cropB,
                Scope = scope
            };
            _db.CropCompatibility.Add(entry);
        }

        if (body.Relation.HasValue) entry.Relation = body.Relation.Value;
        if (body.Reason is not null) entry.Reason = body.Reason;
        if (body.Enabled.HasValue) entry.Enabled = body.Enabled.Value;
        else if (created) entry.Enabled = true;

        if (created && !body.Relation.HasValue)
            entry.Relation = CropCompatibilityRelation.Neutral;

        await _db.SaveChangesAsync(cancellationToken);

        await _audit.WriteFromHttpAsync(
            HttpContext, GetAdminId(),
            created ? "compatibility.create" : "compatibility.update",
            nameof(CropCompatibility), entry.Id.ToString(),
            result: "success",
            extra: new { entry.CropAId, entry.CropBId, entry.Relation, entry.Enabled },
            cancellationToken: cancellationToken);

        return created
            ? Created($"api/v1/admin/compatibility/{entry.Id}", entry)
            : Ok(entry);
    }

    // ── Plan review ─────────────────────────────────────────────────────────

    [HttpGet("plans")]
    public async Task<IActionResult> ListPlans([FromQuery] bool? flagged, CancellationToken cancellationToken)
    {
        var query = _db.FarmPlans.AsNoTracking();
        if (flagged == true)
            query = query.Where(p => p.IsFlagged);

        var plans = await query
            .Select(p => new
            {
                p.Id,
                p.FarmId,
                p.FarmerId,
                p.Version,
                p.Language,
                p.CreatedAt,
                p.IsFlagged,
                p.ReviewStatus,
                p.ReviewNote,
                p.ContentJson
            })
            .ToListAsync(cancellationToken);

        plans = plans.OrderByDescending(p => p.CreatedAt).Take(50).ToList();

        return Ok(plans);
    }

    [HttpPost("plans/{planId:guid}/review")]
    public async Task<IActionResult> ReviewPlan(
        Guid planId,
        [FromBody] PlanReviewRequest body,
        CancellationToken cancellationToken)
    {
        var action = (body.Action ?? string.Empty).Trim().ToLowerInvariant();
        if (action is not ("approve" or "flag" or "dismiss"))
            return BadRequest(new { error = "action must be approve, flag, or dismiss." });

        var plan = await _db.FarmPlans.FirstOrDefaultAsync(p => p.Id == planId, cancellationToken)
            ?? throw new KeyNotFoundException($"Plan {planId} not found.");

        plan.ReviewNote = body.Note;
        plan.ReviewedAt = DateTimeOffset.UtcNow;

        switch (action)
        {
            case "approve":
                plan.IsFlagged = false;
                plan.ReviewStatus = "approved";
                break;
            case "flag":
                plan.IsFlagged = true;
                plan.ReviewStatus = "flagged";
                break;
            case "dismiss":
                plan.IsFlagged = false;
                plan.ReviewStatus = "dismissed";
                break;
        }

        await _db.SaveChangesAsync(cancellationToken);

        await _audit.WriteFromHttpAsync(
            HttpContext, GetAdminId(), "plan.review", nameof(FarmPlan), plan.Id.ToString(),
            result: "success",
            extra: new { action, plan.ReviewStatus, plan.IsFlagged, note = body.Note },
            cancellationToken: cancellationToken);

        return Ok(new
        {
            plan.Id,
            plan.IsFlagged,
            plan.ReviewStatus,
            plan.ReviewNote,
            plan.ReviewedAt
        });
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

public sealed record CreateCropRequest(string Id, string NameEn, string? NameUr, string? IconUrl, bool? Enabled);
public sealed record UpdateCropRequest(string? NameEn, string? NameUr, string? IconUrl, bool? Enabled);

public sealed record CreateSeedVarietyRequest(
    string Id,
    string CropId,
    string NameEn,
    string? NameUr,
    SeedVarietyType? VarietyType,
    bool? Enabled,
    int? MaturityDays,
    RiskBand? RiskBand);

public sealed record UpdateSeedVarietyRequest(
    string? CropId,
    string? NameEn,
    string? NameUr,
    SeedVarietyType? VarietyType,
    bool? Enabled,
    int? MaturityDays,
    RiskBand? RiskBand);

public sealed record CreateProductionAreaTypeRequest(
    string Code,
    string NameEn,
    string? NameUr,
    ProductionAreaTypeCategory? Category,
    bool? Enabled);

public sealed record UpdateProductionAreaTypeRequest(
    string? NameEn,
    string? NameUr,
    ProductionAreaTypeCategory? Category,
    bool? Enabled);

public sealed record UpsertCompatibilityRequest(
    Guid? Id,
    string CropAId,
    string CropBId,
    CropCompatibilityRelation? Relation,
    string? Reason,
    CropCompatibilityScope? Scope,
    bool? Enabled);

public sealed record PlanReviewRequest(string Action, string? Note);
