using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.ProductionAreas.Dtos;
using HappyVeggie.Domain.Entities;
using HappyVeggie.Domain.Enums;
using HappyVeggie.Domain.Helpers;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.ProductionAreas.CreateProductionArea;

public sealed class CreateProductionAreaCommandHandler : IRequestHandler<CreateProductionAreaCommand, ProductionAreaDetailDto>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public CreateProductionAreaCommandHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<ProductionAreaDetailDto> Handle(CreateProductionAreaCommand request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        // Verify type code exists and is enabled.
        var areaType = await _db.ProductionAreaTypes
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Code == request.TypeCode && t.Enabled, cancellationToken)
            ?? throw new KeyNotFoundException($"Production area type '{request.TypeCode}' not found or not enabled.");

        var isCovered = !AreaAggregationRules.IsLandType(request.TypeCode);
        var (canonicalValue, _) = AreaConverter.ToCanonical(
            request.AreaInputValue,
            ParseUnit(request.AreaInputUnit),
            isCovered);

        // Validate land sum if land type.
        if (!isCovered)
        {
            var farm = await _db.Farms.AsNoTracking()
                .FirstAsync(f => f.Id == request.FarmId, cancellationToken);

            var existingAreas = await _db.ProductionAreas.AsNoTracking()
                .Where(a => a.FarmId == request.FarmId && !a.IsDeleted)
                .Select(a => new { a.TypeCode, a.AreaCanonicalValue })
                .ToListAsync(cancellationToken);

            var allAreas = existingAreas
                .Select(a => (a.TypeCode, a.AreaCanonicalValue))
                .Append((request.TypeCode, canonicalValue));

            var validation = AreaAggregationRules.ValidateLandSum(farm.AreaAcres, allAreas);
            if (!validation.IsValid)
            {
                throw new FluentValidation.ValidationException(
                    $"Land area total ({validation.TotalLandAcres:F2} acres) would exceed farm total ({validation.FarmAreaAcres:F2} acres).");
            }
        }

        var now = DateTimeOffset.UtcNow;
        var area = new ProductionArea
        {
            Id = Guid.NewGuid(),
            FarmId = request.FarmId,
            TypeCode = request.TypeCode,
            Name = request.Name,
            AreaInputValue = request.AreaInputValue,
            AreaInputUnit = request.AreaInputUnit,
            AreaCanonicalValue = canonicalValue,
            TemperatureC = request.TemperatureC,
            TemperatureProvenance = ParseProvenance(request.TemperatureProvenance),
            HumidityPercent = request.HumidityPercent,
            HumidityProvenance = ParseProvenance(request.HumidityProvenance),
            Ventilation = request.Ventilation,
            GrowingMedium = request.GrowingMedium,
            StructureType = request.StructureType,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.ProductionAreas.Add(area);
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

    private static DataProvenance? ParseProvenance(string? value)
    {
        if (value is null) return null;
        return Enum.TryParse<DataProvenance>(value, true, out var p) ? p : null;
    }
}
