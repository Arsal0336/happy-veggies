using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.Water.Dtos;
using HappyVeggie.Domain.Entities;
using HappyVeggie.Domain.Enums;
using MediatR;

namespace HappyVeggie.Application.Water.CreateWaterSource;

public sealed class CreateWaterSourceCommandHandler
    : IRequestHandler<CreateWaterSourceCommand, WaterSourceDto>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public CreateWaterSourceCommandHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<WaterSourceDto> Handle(
        CreateWaterSourceCommand request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        if (string.IsNullOrWhiteSpace(request.Type))
            throw new FluentValidation.ValidationException("Water source type is required.");

        var now = DateTimeOffset.UtcNow;
        var entity = new WaterSource
        {
            Id = Guid.NewGuid(),
            FarmId = request.FarmId,
            Type = request.Type.Trim(),
            AvailabilityValue = request.AvailabilityValue,
            AvailabilityUnit = request.AvailabilityUnit,
            AvailabilityProvenance = ParseProvenance(request.AvailabilityProvenance),
            SeasonalAvailability = request.SeasonalAvailability,
            SeasonalAvailabilityProvenance = ParseProvenance(request.SeasonalAvailabilityProvenance),
            CapacityEstimateValue = request.CapacityEstimateValue,
            CapacityEstimateUnit = request.CapacityEstimateUnit,
            CapacityEstimateProvenance = ParseProvenance(request.CapacityEstimateProvenance),
            ReliabilityValue = request.ReliabilityValue,
            ReliabilityProvenance = ParseProvenance(request.ReliabilityProvenance),
            IrrigationMethod = request.IrrigationMethod,
            IrrigationMethodProvenance = ParseProvenance(request.IrrigationMethodProvenance)
                ?? (request.IrrigationMethod is not null ? DataProvenance.FarmerProvided : null),
            ServedCropZoneIdsJson = request.ServedCropZoneIdsJson,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.WaterSources.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        return WaterSourceMapping.ToDto(entity);
    }

    private static DataProvenance? ParseProvenance(string? value)
    {
        if (value is null) return null;
        return Enum.TryParse<DataProvenance>(value, true, out var p) ? p : null;
    }
}
