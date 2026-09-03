using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.ProductionAreas.Dtos;
using HappyVeggie.Domain.Enums;
using HappyVeggie.Domain.Helpers;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.ProductionAreas.UpdateProductionArea;

public sealed class UpdateProductionAreaCommandHandler : IRequestHandler<UpdateProductionAreaCommand, ProductionAreaDetailDto>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public UpdateProductionAreaCommandHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<ProductionAreaDetailDto> Handle(UpdateProductionAreaCommand request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        var area = await _db.ProductionAreas
            .FirstOrDefaultAsync(a => a.Id == request.AreaId && a.FarmId == request.FarmId && !a.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException($"Production area {request.AreaId} not found.");

        if (request.Name is not null) area.Name = request.Name;
        if (request.AreaInputValue.HasValue && request.AreaInputUnit is not null)
        {
            area.AreaInputValue = request.AreaInputValue.Value;
            area.AreaInputUnit = request.AreaInputUnit;
            var isCovered = !AreaAggregationRules.IsLandType(area.TypeCode);
            var unit = ParseUnit(request.AreaInputUnit);
            var (canonical, _) = AreaConverter.ToCanonical(request.AreaInputValue.Value, unit, isCovered);
            area.AreaCanonicalValue = canonical;
        }
        if (request.TemperatureC.HasValue) area.TemperatureC = request.TemperatureC.Value;
        if (request.HumidityPercent.HasValue) area.HumidityPercent = request.HumidityPercent.Value;
        if (request.Ventilation is not null) area.Ventilation = request.Ventilation;
        if (request.GrowingMedium is not null) area.GrowingMedium = request.GrowingMedium;
        if (request.StructureType is not null) area.StructureType = request.StructureType;

        area.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return area.ToDto();
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
