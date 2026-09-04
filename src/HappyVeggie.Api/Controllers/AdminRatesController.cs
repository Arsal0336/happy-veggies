using System.Security.Claims;
using HappyVeggie.Api.Helpers;
using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Api.Controllers;

[ApiController]
[Route("api/v1/admin/government-rates")]
[Authorize(Roles = "Admin")]
public sealed class AdminRatesController : ControllerBase
{
    private readonly IApplicationDbContext _db;
    private readonly IAdminAuditService _audit;

    public AdminRatesController(IApplicationDbContext db, IAdminAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    private Guid GetAdminId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<GovernmentCropRate>>> List(CancellationToken cancellationToken)
    {
        var rates = await _db.GovernmentCropRates
            .AsNoTracking()
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);
        return Ok(rates);
    }

    [HttpPost]
    public async Task<ActionResult<GovernmentCropRate>> Create(
        [FromBody] CreateRateRequest body,
        CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var rate = new GovernmentCropRate
        {
            Id = Guid.NewGuid(),
            CropId = body.CropId,
            Unit = body.Unit ?? "kg",
            RatePerUnit = body.RatePerUnit,
            Currency = body.Currency ?? "PKR",
            Period = body.Period,
            SourceLabel = body.SourceLabel,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.GovernmentCropRates.Add(rate);
        await _db.SaveChangesAsync(cancellationToken);

        await _audit.WriteFromHttpAsync(
            HttpContext,
            GetAdminId(),
            "government_rate.create",
            nameof(GovernmentCropRate),
            rate.Id.ToString(),
            result: "success",
            extra: new { rate.CropId, rate.RatePerUnit, rate.Period },
            cancellationToken: cancellationToken);

        return Created($"api/v1/admin/government-rates/{rate.Id}", rate);
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<GovernmentCropRate>> Update(
        Guid id,
        [FromBody] UpdateRateRequest body,
        CancellationToken cancellationToken)
    {
        var rate = await _db.GovernmentCropRates
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"Rate {id} not found.");

        if (body.RatePerUnit.HasValue) rate.RatePerUnit = body.RatePerUnit.Value;
        if (body.Unit is not null) rate.Unit = body.Unit;
        if (body.Currency is not null) rate.Currency = body.Currency;
        if (body.Period is not null) rate.Period = body.Period;
        if (body.SourceLabel is not null) rate.SourceLabel = body.SourceLabel;
        if (body.IsActive.HasValue) rate.IsActive = body.IsActive.Value;

        rate.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        await _audit.WriteFromHttpAsync(
            HttpContext,
            GetAdminId(),
            "government_rate.update",
            nameof(GovernmentCropRate),
            rate.Id.ToString(),
            result: "success",
            extra: new { rate.CropId, rate.RatePerUnit, rate.IsActive },
            cancellationToken: cancellationToken);

        return Ok(rate);
    }
}

public sealed record CreateRateRequest(string CropId, string? Unit, decimal RatePerUnit, string? Currency, string Period, string? SourceLabel);
public sealed record UpdateRateRequest(decimal? RatePerUnit, string? Unit, string? Currency, string? Period, string? SourceLabel, bool? IsActive);
