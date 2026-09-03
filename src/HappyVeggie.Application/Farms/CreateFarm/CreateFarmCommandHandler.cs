using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Farms.Dtos;
using HappyVeggie.Domain.Entities;
using HappyVeggie.Domain.Helpers;
using MediatR;

namespace HappyVeggie.Application.Farms.CreateFarm;

public sealed class CreateFarmCommandHandler : IRequestHandler<CreateFarmCommand, FarmDto>
{
    private readonly IApplicationDbContext _db;

    public CreateFarmCommandHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<FarmDto> Handle(CreateFarmCommand request, CancellationToken cancellationToken)
    {
        // Convert input area to canonical acres for storage.
        var areaAcres = request.AreaInputUnit.ToLowerInvariant() switch
        {
            "acre" or "acres" => request.AreaInputValue,
            "kanal" => AreaConverter.ToAcres(request.AreaInputValue, Domain.Enums.AreaUnit.Kanal),
            "marla" => AreaConverter.ToAcres(request.AreaInputValue, Domain.Enums.AreaUnit.Marla),
            "hectare" or "ha" => AreaConverter.ToAcres(request.AreaInputValue, Domain.Enums.AreaUnit.Hectare),
            _ => request.AreaInputValue // fallback — assume acres
        };

        var now = DateTimeOffset.UtcNow;
        var farm = new Farm
        {
            Id = Guid.NewGuid(),
            FarmerId = request.FarmerId,
            Name = request.Name,
            Lat = request.Lat,
            Lng = request.Lng,
            RegionCode = request.RegionCode,
            RegionLabel = request.RegionLabel,
            AreaAcres = areaAcres,
            AreaInputValue = request.AreaInputValue,
            AreaInputUnit = request.AreaInputUnit,
            PreferredCropId = request.PreferredCropId,
            PreferredCropFreeText = request.PreferredCropFreeText,
            IsNewFarmSetup = request.IsNewFarmSetup,
            SoilType = request.SoilType,
            WaterAccess = request.WaterAccess,
            WaterSource = request.WaterSource,
            BudgetAmount = request.BudgetAmount,
            BudgetCurrency = request.BudgetCurrency,
            LetAiChooseCrop = request.LetAiChooseCrop,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.Farms.Add(farm);

        // TASK-063: Create default Open Field production area covering the full farm.
        var defaultArea = new ProductionArea
        {
            Id = Guid.NewGuid(),
            FarmId = farm.Id,
            TypeCode = "open_field",
            Name = "Open Field",
            AreaInputValue = request.AreaInputValue,
            AreaInputUnit = request.AreaInputUnit,
            AreaCanonicalValue = areaAcres,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.ProductionAreas.Add(defaultArea);

        await _db.SaveChangesAsync(cancellationToken);

        return farm.ToDto();
    }
}
