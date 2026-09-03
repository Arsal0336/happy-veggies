using HappyVeggie.Application.ProductionAreas.CreateProductionArea;
using HappyVeggie.Application.ProductionAreas.Dtos;
using HappyVeggie.Application.ProductionAreas.ListProductionAreas;
using HappyVeggie.Application.ProductionAreas.UpdateProductionArea;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HappyVeggie.Api.Controllers;

[ApiController]
[Route("api/v1/farms/{farmId:guid}/production-areas")]
[Authorize(Roles = "Farmer")]
public sealed class ProductionAreaController : ControllerBase
{
    private readonly ISender _sender;

    public ProductionAreaController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductionAreaDetailDto>>> List(Guid farmId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new ListProductionAreasQuery(farmId), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ProductionAreaDetailDto>> Create(
        Guid farmId,
        [FromBody] CreateProductionAreaRequest body,
        CancellationToken cancellationToken)
    {
        var command = new CreateProductionAreaCommand(
            farmId, body.TypeCode, body.Name,
            body.AreaInputValue, body.AreaInputUnit,
            body.TemperatureC, body.TemperatureProvenance,
            body.HumidityPercent, body.HumidityProvenance,
            body.Ventilation, body.GrowingMedium, body.StructureType);

        var result = await _sender.Send(command, cancellationToken);
        return Created($"api/v1/farms/{farmId}/production-areas/{result.Id}", result);
    }

    [HttpPatch("{areaId:guid}")]
    public async Task<ActionResult<ProductionAreaDetailDto>> Update(
        Guid farmId,
        Guid areaId,
        [FromBody] UpdateProductionAreaRequest body,
        CancellationToken cancellationToken)
    {
        var command = new UpdateProductionAreaCommand(
            farmId, areaId, body.Name,
            body.AreaInputValue, body.AreaInputUnit,
            body.TemperatureC, body.HumidityPercent,
            body.Ventilation, body.GrowingMedium, body.StructureType);

        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }
}

public sealed record CreateProductionAreaRequest(
    string TypeCode,
    string? Name,
    decimal AreaInputValue,
    string AreaInputUnit,
    decimal? TemperatureC,
    string? TemperatureProvenance,
    decimal? HumidityPercent,
    string? HumidityProvenance,
    string? Ventilation,
    string? GrowingMedium,
    string? StructureType);

public sealed record UpdateProductionAreaRequest(
    string? Name,
    decimal? AreaInputValue,
    string? AreaInputUnit,
    decimal? TemperatureC,
    decimal? HumidityPercent,
    string? Ventilation,
    string? GrowingMedium,
    string? StructureType);
