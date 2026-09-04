using HappyVeggie.Application.CropCycles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HappyVeggie.Api.Controllers;

[ApiController]
[Route("api/v1/farms/{farmId:guid}/crop-cycles")]
[Authorize(Roles = "Farmer")]
public sealed class CropCyclesController : ControllerBase
{
    private readonly CropCycleService _cropCycles;

    public CropCyclesController(CropCycleService cropCycles)
    {
        _cropCycles = cropCycles;
    }

    /// <summary>
    /// Learning comparisons: predicted vs actual (GAP-052). Recommendation feedback is TBD-12.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CropCycleDto>>> List(
        Guid farmId, CancellationToken cancellationToken)
    {
        var result = await _cropCycles.ListForFarmAsync(farmId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Record actuals on a crop cycle. Never overwrites PredictedYield. Delta = actual − predicted.
    /// </summary>
    [HttpPost("{cycleId:guid}/actuals")]
    public async Task<ActionResult<CropCycleDto>> RecordActuals(
        Guid farmId,
        Guid cycleId,
        [FromBody] RecordActualsRequest body,
        CancellationToken cancellationToken)
    {
        var result = await _cropCycles.RecordActualsAsync(
            farmId,
            cycleId,
            body.ActualYield,
            body.ActualYieldUnit,
            body.Notes,
            body.EndedAt,
            cancellationToken);

        return Ok(result);
    }
}

public sealed record RecordActualsRequest(
    decimal? ActualYield,
    string? ActualYieldUnit,
    string? Notes,
    DateTimeOffset? EndedAt);
