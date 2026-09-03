using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.CropZones.Dtos;
using HappyVeggie.Domain.Entities;
using HappyVeggie.Domain.Enums;
using HappyVeggie.Domain.Helpers;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.CropZones.CreateCropZone;

public sealed class CreateCropZoneCommandHandler : IRequestHandler<CreateCropZoneCommand, CropZoneDetailDto>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public CreateCropZoneCommandHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<CropZoneDetailDto> Handle(CreateCropZoneCommand request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        // Ensure the production area exists.
        var area = await _db.ProductionAreas.AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == request.ProductionAreaId && a.FarmId == request.FarmId && !a.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException($"Production area {request.ProductionAreaId} not found.");

        var isCovered = !AreaAggregationRules.IsLandType(area.TypeCode);
        var unit = ParseUnit(request.AreaInputUnit);
        var (canonical, _) = AreaConverter.ToCanonical(request.AreaInputValue, unit, isCovered);

        var now = DateTimeOffset.UtcNow;
        var zone = new CropZone
        {
            Id = Guid.NewGuid(),
            FarmId = request.FarmId,
            ProductionAreaId = request.ProductionAreaId,
            Label = request.Label,
            AreaInputValue = request.AreaInputValue,
            AreaInputUnit = request.AreaInputUnit,
            AreaCanonicalValue = canonical,
            CropId = request.CropId,
            CropFreetext = request.CropFreetext,
            SeedVarietyId = request.SeedVarietyId,
            PlantingDate = request.PlantingDate,
            GrowthStage = request.GrowthStage,
            ExpectedYieldValue = request.ExpectedYieldValue,
            ExpectedYieldUnit = request.ExpectedYieldUnit,
            IsExperimental = request.IsExperimental,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.CropZones.Add(zone);
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
