using HappyVeggie.Application.Water.CreateWaterSource;
using HappyVeggie.Application.Water.DeleteWaterSource;
using HappyVeggie.Application.Water.Dtos;
using HappyVeggie.Application.Water.ListWaterSources;
using HappyVeggie.Application.Water.UpdateWaterSource;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HappyVeggie.Api.Controllers;

[ApiController]
[Route("api/v1/farms/{farmId:guid}/water-sources")]
[Authorize(Roles = "Farmer")]
public sealed class WaterSourceController : ControllerBase
{
    private readonly ISender _sender;

    public WaterSourceController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<WaterSourceDto>>> List(
        Guid farmId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new ListWaterSourcesQuery(farmId), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<WaterSourceDto>> Create(
        Guid farmId,
        [FromBody] CreateWaterSourceRequest body,
        CancellationToken cancellationToken)
    {
        var command = new CreateWaterSourceCommand(
            farmId,
            body.Type,
            body.AvailabilityValue,
            body.AvailabilityUnit,
            body.AvailabilityProvenance,
            body.SeasonalAvailability,
            body.SeasonalAvailabilityProvenance,
            body.CapacityEstimateValue,
            body.CapacityEstimateUnit,
            body.CapacityEstimateProvenance,
            body.ReliabilityValue,
            body.ReliabilityProvenance,
            body.IrrigationMethod,
            body.IrrigationMethodProvenance,
            body.ServedCropZoneIdsJson);

        var result = await _sender.Send(command, cancellationToken);
        return Created($"api/v1/farms/{farmId}/water-sources/{result.Id}", result);
    }

    [HttpPatch("{waterSourceId:guid}")]
    public async Task<ActionResult<WaterSourceDto>> Update(
        Guid farmId,
        Guid waterSourceId,
        [FromBody] UpdateWaterSourceRequest body,
        CancellationToken cancellationToken)
    {
        var command = new UpdateWaterSourceCommand(
            farmId,
            waterSourceId,
            body.Type,
            body.AvailabilityValue,
            body.AvailabilityUnit,
            body.AvailabilityProvenance,
            body.SeasonalAvailability,
            body.SeasonalAvailabilityProvenance,
            body.CapacityEstimateValue,
            body.CapacityEstimateUnit,
            body.CapacityEstimateProvenance,
            body.ReliabilityValue,
            body.ReliabilityProvenance,
            body.IrrigationMethod,
            body.IrrigationMethodProvenance,
            body.ServedCropZoneIdsJson);

        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{waterSourceId:guid}")]
    public async Task<IActionResult> Delete(
        Guid farmId, Guid waterSourceId, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteWaterSourceCommand(farmId, waterSourceId), cancellationToken);
        return NoContent();
    }
}

public sealed record CreateWaterSourceRequest(
    string Type,
    decimal? AvailabilityValue,
    string? AvailabilityUnit,
    string? AvailabilityProvenance,
    string? SeasonalAvailability,
    string? SeasonalAvailabilityProvenance,
    decimal? CapacityEstimateValue,
    string? CapacityEstimateUnit,
    string? CapacityEstimateProvenance,
    decimal? ReliabilityValue,
    string? ReliabilityProvenance,
    string? IrrigationMethod,
    string? IrrigationMethodProvenance,
    string? ServedCropZoneIdsJson);

public sealed record UpdateWaterSourceRequest(
    string? Type,
    decimal? AvailabilityValue,
    string? AvailabilityUnit,
    string? AvailabilityProvenance,
    string? SeasonalAvailability,
    string? SeasonalAvailabilityProvenance,
    decimal? CapacityEstimateValue,
    string? CapacityEstimateUnit,
    string? CapacityEstimateProvenance,
    decimal? ReliabilityValue,
    string? ReliabilityProvenance,
    string? IrrigationMethod,
    string? IrrigationMethodProvenance,
    string? ServedCropZoneIdsJson);
