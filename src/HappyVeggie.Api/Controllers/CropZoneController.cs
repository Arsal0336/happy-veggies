using HappyVeggie.Application.CropZones.CreateCropZone;
using HappyVeggie.Application.CropZones.DeleteCropZone;
using HappyVeggie.Application.CropZones.Dtos;
using HappyVeggie.Application.CropZones.ListCropZones;
using HappyVeggie.Application.CropZones.UpdateCropZone;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HappyVeggie.Api.Controllers;

[ApiController]
[Route("api/v1/farms/{farmId:guid}/production-areas/{areaId:guid}/zones")]
[Authorize(Roles = "Farmer")]
public sealed class CropZoneController : ControllerBase
{
    private readonly ISender _sender;

    public CropZoneController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CropZoneDetailDto>>> List(
        Guid farmId, Guid areaId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new ListCropZonesQuery(farmId, areaId), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CropZoneDetailDto>> Create(
        Guid farmId, Guid areaId,
        [FromBody] CreateCropZoneRequest body,
        CancellationToken cancellationToken)
    {
        var command = new CreateCropZoneCommand(
            farmId, areaId,
            body.Label, body.AreaInputValue, body.AreaInputUnit,
            body.CropId, body.CropFreetext, body.SeedVarietyId,
            body.PlantingDate, body.GrowthStage,
            body.ExpectedYieldValue, body.ExpectedYieldUnit,
            body.IsExperimental);

        var result = await _sender.Send(command, cancellationToken);
        return Created($"api/v1/farms/{farmId}/production-areas/{areaId}/zones/{result.Id}", result);
    }

    [HttpPatch("{zoneId:guid}")]
    public async Task<ActionResult<CropZoneDetailDto>> Update(
        Guid farmId, Guid areaId, Guid zoneId,
        [FromBody] UpdateCropZoneRequest body,
        CancellationToken cancellationToken)
    {
        var command = new UpdateCropZoneCommand(
            farmId, zoneId,
            body.Label, body.AreaInputValue, body.AreaInputUnit,
            body.CropId, body.CropFreetext, body.SeedVarietyId,
            body.PlantingDate, body.GrowthStage,
            body.ExpectedYieldValue, body.ExpectedYieldUnit);

        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{zoneId:guid}")]
    public async Task<IActionResult> Delete(
        Guid farmId, Guid areaId, Guid zoneId, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteCropZoneCommand(farmId, areaId, zoneId), cancellationToken);
        return NoContent();
    }
}

public sealed record CreateCropZoneRequest(
    string? Label,
    decimal AreaInputValue,
    string AreaInputUnit,
    string? CropId,
    string? CropFreetext,
    string? SeedVarietyId,
    DateOnly? PlantingDate,
    string? GrowthStage,
    decimal? ExpectedYieldValue,
    string? ExpectedYieldUnit,
    bool IsExperimental);

public sealed record UpdateCropZoneRequest(
    string? Label,
    decimal? AreaInputValue,
    string? AreaInputUnit,
    string? CropId,
    string? CropFreetext,
    string? SeedVarietyId,
    DateOnly? PlantingDate,
    string? GrowthStage,
    decimal? ExpectedYieldValue,
    string? ExpectedYieldUnit);
