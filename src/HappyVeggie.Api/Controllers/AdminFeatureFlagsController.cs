using System.Security.Claims;
using HappyVeggie.Api.Helpers;
using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Api.Controllers;

[ApiController]
[Route("api/v1/admin/feature-flags")]
[Authorize(Roles = "Admin")]
public sealed class AdminFeatureFlagsController : ControllerBase
{
    private readonly IApplicationDbContext _db;
    private readonly IAdminAuditService _audit;

    public AdminFeatureFlagsController(IApplicationDbContext db, IAdminAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    private Guid GetAdminId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FeatureFlagDto>>> List(CancellationToken cancellationToken)
    {
        var flags = await _db.FeatureFlags
            .AsNoTracking()
            .OrderBy(f => f.Key)
            .Select(f => new FeatureFlagDto(f.Key, f.Enabled, f.Description, f.UpdatedAt, f.UpdatedByAdminId))
            .ToListAsync(cancellationToken);

        return Ok(flags);
    }

    [HttpPatch("{key}")]
    public async Task<ActionResult<FeatureFlagDto>> Patch(
        string key,
        [FromBody] PatchFeatureFlagRequest body,
        CancellationToken cancellationToken)
    {
        var flag = await _db.FeatureFlags
            .FirstOrDefaultAsync(f => f.Key == key, cancellationToken)
            ?? throw new KeyNotFoundException($"Feature flag '{key}' not found.");

        var previous = flag.Enabled;
        flag.Enabled = body.Enabled;
        flag.UpdatedAt = DateTimeOffset.UtcNow;
        flag.UpdatedByAdminId = GetAdminId();

        await _db.SaveChangesAsync(cancellationToken);

        await _audit.WriteFromHttpAsync(
            HttpContext,
            GetAdminId(),
            "feature_flag.update",
            nameof(FeatureFlag),
            flag.Key,
            result: "success",
            extra: new { previous, enabled = flag.Enabled },
            cancellationToken: cancellationToken);

        return Ok(new FeatureFlagDto(flag.Key, flag.Enabled, flag.Description, flag.UpdatedAt, flag.UpdatedByAdminId));
    }
}

public sealed record FeatureFlagDto(
    string Key,
    bool Enabled,
    string? Description,
    DateTimeOffset UpdatedAt,
    Guid? UpdatedByAdminId);

public sealed record PatchFeatureFlagRequest(bool Enabled);
