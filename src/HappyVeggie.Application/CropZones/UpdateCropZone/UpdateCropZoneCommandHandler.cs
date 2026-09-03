using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.CropZones.Dtos;
using HappyVeggie.Domain.Enums;
using HappyVeggie.Domain.Helpers;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.CropZones.UpdateCropZone;

public sealed class UpdateCropZoneCommandHandler : IRequestHandler<UpdateCropZoneCommand, CropZoneDetailDto>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public UpdateCropZoneCommandHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<CropZoneDetailDto> Handle(UpdateCropZoneCommand request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        var zone = await _db.CropZones
            .FirstOrDefaultAsync(z => z.Id == request.ZoneId && z.FarmId == request.FarmId && !z.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException($"Crop zone {request.ZoneId} not found.");

        if (request.Label is not null) zone.Label = request.Label;
        if (request.AreaInputValue.HasValue && request.AreaInputUnit is not null)
        {
            zone.AreaInputValue = request.AreaInputValue.Value;
            zone.AreaInputUnit = request.AreaInputUnit;

            var area = await _db.ProductionAreas.AsNoTracking()
                .FirstAsync(a => a.Id == zone.ProductionAreaId, cancellationToken);
            var isCovered = !AreaAggregationRules.IsLandType(area.TypeCode);
            var unit = ParseUnit(request.AreaInputUnit);
            var (canonical, _) = AreaConverter.ToCanonical(request.AreaInputValue.Value, unit, isCovered);
            zone.AreaCanonicalValue = canonical;
        }
        if (request.CropId is not null) zone.CropId = request.CropId;
        if (request.CropFreetext is not null) zone.CropFreetext = request.CropFreetext;
        if (request.SeedVarietyId is not null) zone.SeedVarietyId = request.SeedVarietyId;
        if (request.PlantingDate.HasValue) zone.PlantingDate = request.PlantingDate.Value;
        if (request.GrowthStage is not null) zone.GrowthStage = request.GrowthStage;
        if (request.ExpectedYieldValue.HasValue) zone.ExpectedYieldValue = request.ExpectedYieldValue.Value;
        if (request.ExpectedYieldUnit is not null) zone.ExpectedYieldUnit = request.ExpectedYieldUnit;

        zone.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return zone.ToDto();
    }

    private static AreaUnit ParseUnit(string unit) => unit.ToLowerInvariant() switch
    {
        "acre" or "acres" => AreaUnit.Acre,
        "kanal" => AreaUnit.Kanal,
        "marla" => AreaUnit.Marla,
        "hectare" or "ha" => AreaUnit.Hectare,
        "sqft" or "sq_ft" or "square_feet" => AreaUnit.SquareFeet,
        "sqm" or "sq_m" or "square_meters" => AreaUnit.SquareMeters,
        _ => AreaUnit.Acre
    };
}
