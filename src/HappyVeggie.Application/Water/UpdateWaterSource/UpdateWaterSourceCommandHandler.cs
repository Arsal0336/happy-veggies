using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.Water.Dtos;
using HappyVeggie.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Water.UpdateWaterSource;

public sealed class UpdateWaterSourceCommandHandler
    : IRequestHandler<UpdateWaterSourceCommand, WaterSourceDto>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public UpdateWaterSourceCommandHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<WaterSourceDto> Handle(
        UpdateWaterSourceCommand request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        var entity = await _db.WaterSources
            .FirstOrDefaultAsync(
                w => w.Id == request.WaterSourceId && w.FarmId == request.FarmId && !w.IsDeleted,
                cancellationToken)
            ?? throw new KeyNotFoundException($"Water source {request.WaterSourceId} not found.");

        if (request.Type is not null)
            entity.Type = request.Type.Trim();

        if (request.AvailabilityValue is not null)
            entity.AvailabilityValue = request.AvailabilityValue;
        if (request.AvailabilityUnit is not null)
            entity.AvailabilityUnit = request.AvailabilityUnit;
        if (request.AvailabilityProvenance is not null)
            entity.AvailabilityProvenance = ParseProvenance(request.AvailabilityProvenance);

        if (request.SeasonalAvailability is not null)
            entity.SeasonalAvailability = request.SeasonalAvailability;
        if (request.SeasonalAvailabilityProvenance is not null)
            entity.SeasonalAvailabilityProvenance = ParseProvenance(request.SeasonalAvailabilityProvenance);

        if (request.CapacityEstimateValue is not null)
            entity.CapacityEstimateValue = request.CapacityEstimateValue;
        if (request.CapacityEstimateUnit is not null)
            entity.CapacityEstimateUnit = request.CapacityEstimateUnit;
        if (request.CapacityEstimateProvenance is not null)
            entity.CapacityEstimateProvenance = ParseProvenance(request.CapacityEstimateProvenance);

        if (request.ReliabilityValue is not null)
            entity.ReliabilityValue = request.ReliabilityValue;
        if (request.ReliabilityProvenance is not null)
            entity.ReliabilityProvenance = ParseProvenance(request.ReliabilityProvenance);

        if (request.IrrigationMethod is not null)
            entity.IrrigationMethod = request.IrrigationMethod;
        if (request.IrrigationMethodProvenance is not null)
            entity.IrrigationMethodProvenance = ParseProvenance(request.IrrigationMethodProvenance);

        if (request.ServedCropZoneIdsJson is not null)
            entity.ServedCropZoneIdsJson = request.ServedCropZoneIdsJson;

        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        return WaterSourceMapping.ToDto(entity);
    }

    private static DataProvenance? ParseProvenance(string? value)
    {
        if (value is null) return null;
        return Enum.TryParse<DataProvenance>(value, true, out var p) ? p : null;
    }
}
