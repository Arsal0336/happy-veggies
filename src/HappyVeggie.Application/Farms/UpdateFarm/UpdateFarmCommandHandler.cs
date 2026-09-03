using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.Farms.Dtos;
using HappyVeggie.Domain.Helpers;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Farms.UpdateFarm;

public sealed class UpdateFarmCommandHandler : IRequestHandler<UpdateFarmCommand, FarmDto>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public UpdateFarmCommandHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<FarmDto> Handle(UpdateFarmCommand request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        var farm = await _db.Farms
            .FirstOrDefaultAsync(f => f.Id == request.FarmId && !f.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException($"Farm {request.FarmId} not found.");

        if (request.Name is not null) farm.Name = request.Name;
        if (request.Lat.HasValue) farm.Lat = request.Lat.Value;
        if (request.Lng.HasValue) farm.Lng = request.Lng.Value;
        if (request.RegionCode is not null) farm.RegionCode = request.RegionCode;
        if (request.RegionLabel is not null) farm.RegionLabel = request.RegionLabel;
        if (request.AreaInputValue.HasValue && request.AreaInputUnit is not null)
        {
            farm.AreaInputValue = request.AreaInputValue.Value;
            farm.AreaInputUnit = request.AreaInputUnit;
            farm.AreaAcres = request.AreaInputUnit.ToLowerInvariant() switch
            {
                "acre" or "acres" => request.AreaInputValue.Value,
                "kanal" => AreaConverter.ToAcres(request.AreaInputValue.Value, Domain.Enums.AreaUnit.Kanal),
                "marla" => AreaConverter.ToAcres(request.AreaInputValue.Value, Domain.Enums.AreaUnit.Marla),
                "hectare" or "ha" => AreaConverter.ToAcres(request.AreaInputValue.Value, Domain.Enums.AreaUnit.Hectare),
                _ => request.AreaInputValue.Value
            };
        }
        if (request.PreferredCropId is not null) farm.PreferredCropId = request.PreferredCropId;
        if (request.PreferredCropFreeText is not null) farm.PreferredCropFreeText = request.PreferredCropFreeText;
        if (request.SoilType is not null) farm.SoilType = request.SoilType;
        if (request.WaterAccess.HasValue) farm.WaterAccess = request.WaterAccess.Value;
        if (request.WaterSource is not null) farm.WaterSource = request.WaterSource;
        if (request.BudgetAmount.HasValue) farm.BudgetAmount = request.BudgetAmount.Value;
        if (request.BudgetCurrency is not null) farm.BudgetCurrency = request.BudgetCurrency;
        if (request.LetAiChooseCrop.HasValue) farm.LetAiChooseCrop = request.LetAiChooseCrop.Value;

        farm.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return farm.ToDto();
    }
}
