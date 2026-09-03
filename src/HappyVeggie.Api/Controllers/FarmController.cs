using System.Security.Claims;
using HappyVeggie.Application.Farms.CreateFarm;
using HappyVeggie.Application.Farms.Dtos;
using HappyVeggie.Application.Farms.GetFarm;
using HappyVeggie.Application.Farms.ListFarms;
using HappyVeggie.Application.Farms.UpdateFarm;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HappyVeggie.Api.Controllers;

[ApiController]
[Route("api/v1/farms")]
[Authorize(Roles = "Farmer")]
public sealed class FarmController : ControllerBase
{
    private readonly ISender _sender;

    public FarmController(ISender sender)
    {
        _sender = sender;
    }

    private Guid GetFarmerId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FarmDto>>> List(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new ListFarmsQuery(GetFarmerId()), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<FarmDto>> Create([FromBody] CreateFarmRequest body, CancellationToken cancellationToken)
    {
        var command = new CreateFarmCommand(
            GetFarmerId(),
            body.Name, body.Lat, body.Lng,
            body.RegionCode, body.RegionLabel,
            body.AreaInputValue, body.AreaInputUnit,
            body.PreferredCropId, body.PreferredCropFreeText,
            body.IsNewFarmSetup,
            body.SoilType, body.WaterAccess, body.WaterSource,
            body.BudgetAmount, body.BudgetCurrency,
            body.LetAiChooseCrop);

        var result = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(Get), new { farmId = result.Id }, result);
    }

    [HttpGet("{farmId:guid}")]
    public async Task<ActionResult<FarmDto>> Get(Guid farmId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetFarmQuery(farmId), cancellationToken);
        return Ok(result);
    }

    [HttpPatch("{farmId:guid}")]
    public async Task<ActionResult<FarmDto>> Update(Guid farmId, [FromBody] UpdateFarmRequest body, CancellationToken cancellationToken)
    {
        var command = new UpdateFarmCommand(
            farmId,
            body.Name, body.Lat, body.Lng,
            body.RegionCode, body.RegionLabel,
            body.AreaInputValue, body.AreaInputUnit,
            body.PreferredCropId, body.PreferredCropFreeText,
            body.SoilType, body.WaterAccess, body.WaterSource,
            body.BudgetAmount, body.BudgetCurrency,
            body.LetAiChooseCrop);

        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }
}

public sealed record CreateFarmRequest(
    string? Name,
    decimal Lat,
    decimal Lng,
    string RegionCode,
    string RegionLabel,
    decimal AreaInputValue,
    string AreaInputUnit,
    string? PreferredCropId,
    string? PreferredCropFreeText,
    bool IsNewFarmSetup,
    string? SoilType,
    bool? WaterAccess,
    string? WaterSource,
    decimal? BudgetAmount,
    string? BudgetCurrency,
    bool LetAiChooseCrop);

public sealed record UpdateFarmRequest(
    string? Name,
    decimal? Lat,
    decimal? Lng,
    string? RegionCode,
    string? RegionLabel,
    decimal? AreaInputValue,
    string? AreaInputUnit,
    string? PreferredCropId,
    string? PreferredCropFreeText,
    string? SoilType,
    bool? WaterAccess,
    string? WaterSource,
    decimal? BudgetAmount,
    string? BudgetCurrency,
    bool? LetAiChooseCrop);
