using System.Security.Claims;
using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.Nearby;
using HappyVeggie.Application.Suggestions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Api.Controllers;

[ApiController]
[Route("api/v1/farms/{farmId:guid}")]
[Authorize(Roles = "Farmer")]
public sealed class SuggestionsController : ControllerBase
{
    private readonly NearbyFarmsService _nearbyService;
    private readonly SeedVarietySuggestionService _varietyService;
    private readonly FarmOwnershipGuard _ownershipGuard;
    private readonly IApplicationDbContext _db;

    public SuggestionsController(
        NearbyFarmsService nearbyService,
        SeedVarietySuggestionService varietyService,
        FarmOwnershipGuard ownershipGuard,
        IApplicationDbContext db)
    {
        _nearbyService = nearbyService;
        _varietyService = varietyService;
        _ownershipGuard = ownershipGuard;
        _db = db;
    }

    [HttpGet("suggestions")]
    public async Task<ActionResult<IReadOnlyList<CropSuggestionDto>>> GetCropSuggestions(
        Guid farmId, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(farmId, cancellationToken);

        var farm = await _db.Farms.AsNoTracking()
            .FirstAsync(f => f.Id == farmId, cancellationToken);

        var result = await _nearbyService.GetSuggestionsAsync(farm.RegionCode, farmId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("seed-suggestions/{cropId}")]
    public async Task<ActionResult<IReadOnlyList<SeedVarietySuggestionDto>>> GetSeedSuggestions(
        Guid farmId, string cropId, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(farmId, cancellationToken);
        var result = await _varietyService.SuggestAsync(cropId, cancellationToken);
        return Ok(result);
    }
}
