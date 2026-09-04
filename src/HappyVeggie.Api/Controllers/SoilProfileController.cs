using HappyVeggie.Application.Soil.Dtos;
using HappyVeggie.Application.Soil.ListSoilProfiles;
using HappyVeggie.Application.Soil.UpsertSoilProfile;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HappyVeggie.Api.Controllers;

[ApiController]
[Route("api/v1/farms/{farmId:guid}/soil-profiles")]
[Authorize(Roles = "Farmer")]
public sealed class SoilProfileController : ControllerBase
{
    private readonly ISender _sender;

    public SoilProfileController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SoilProfileDto>>> List(
        Guid farmId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new ListSoilProfilesQuery(farmId), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Upsert farm-level or production-area soil profile (matched by productionAreaId).
    /// </summary>
    [HttpPut]
    public async Task<ActionResult<SoilProfileDto>> Upsert(
        Guid farmId,
        [FromBody] UpsertSoilProfileRequest body,
        CancellationToken cancellationToken)
    {
        var command = new UpsertSoilProfileCommand(
            farmId,
            body.ProductionAreaId,
            body.SoilType,
            body.SoilTypeProvenance,
            body.Texture,
            body.TextureProvenance,
            body.PhValue,
            body.PhValueProvenance,
            body.OrganicMatter ?? body.OrganicMatterValue,
            body.OrganicMatterProvenance,
            body.Nitrogen ?? body.NitrogenValue,
            body.NitrogenProvenance,
            body.Phosphorus ?? body.PhosphorusValue,
            body.PhosphorusProvenance,
            body.Potassium ?? body.PotassiumValue,
            body.PotassiumProvenance,
            body.FarmerNotes);

        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public Task<ActionResult<SoilProfileDto>> UpsertPost(
        Guid farmId,
        [FromBody] UpsertSoilProfileRequest body,
        CancellationToken cancellationToken)
        => Upsert(farmId, body, cancellationToken);
}

public sealed record UpsertSoilProfileRequest(
    Guid? ProductionAreaId,
    string? SoilType,
    string? SoilTypeProvenance,
    string? Texture,
    string? TextureProvenance,
    decimal? PhValue,
    string? PhValueProvenance,
    decimal? OrganicMatter,
    decimal? OrganicMatterValue,
    string? OrganicMatterProvenance,
    decimal? Nitrogen,
    decimal? NitrogenValue,
    string? NitrogenProvenance,
    decimal? Phosphorus,
    decimal? PhosphorusValue,
    string? PhosphorusProvenance,
    decimal? Potassium,
    decimal? PotassiumValue,
    string? PotassiumProvenance,
    string? FarmerNotes);
