using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.Economics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HappyVeggie.Api.Controllers;

[ApiController]
[Route("api/v1/farms/{farmId:guid}/economics")]
[Authorize(Roles = "Farmer")]
public sealed class EconomicsController : ControllerBase
{
    private readonly EconomicsService _economics;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public EconomicsController(EconomicsService economics, FarmOwnershipGuard ownershipGuard)
    {
        _economics = economics;
        _ownershipGuard = ownershipGuard;
    }

    /// <summary>
    /// Compute-on-read farm economics. Government rates are historical_reference (C-006).
    /// Expected amount converts yield into the rate unit (kg / maund / t) before multiplying.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<FarmEconomicsResponse>> Get(
        Guid farmId, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(farmId, cancellationToken);

        var snapshots = await _economics.CalculateForFarmAsync(farmId, cancellationToken);

        var items = snapshots.Select(s => new FarmEconomicItemDto(
            s.CropZoneId,
            s.CropId,
            s.ExpectedYield,
            s.YieldUnit,
            s.RatePerUnit,
            s.RateUnit,
            s.Currency,
            s.ReferenceGrossValue,
            s.YieldInRateUnit,
            s.Period,
            s.SourceLabel,
            RateLabel: "historical_reference")).ToList();

        return Ok(new FarmEconomicsResponse(
            Disclaimer: "Government rates are historical_reference (C-006). Expected amount = converted yield × rate. Not live market prices.",
            RatesLabel: "historical_reference",
            Items: items));
    }
}

public sealed record FarmEconomicsResponse(
    string Disclaimer,
    string RatesLabel,
    IReadOnlyList<FarmEconomicItemDto> Items);

public sealed record FarmEconomicItemDto(
    Guid CropZoneId,
    string CropId,
    decimal ExpectedYield,
    string YieldUnit,
    decimal RatePerUnit,
    string RateUnit,
    string Currency,
    decimal ReferenceGrossValue,
    decimal YieldInRateUnit,
    string Period,
    string? SourceLabel,
    string RateLabel);
