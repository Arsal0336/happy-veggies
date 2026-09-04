using HappyVeggie.Application.Water.Dtos;
using HappyVeggie.Domain.Entities;

namespace HappyVeggie.Application.Water;

internal static class WaterSourceMapping
{
    public static WaterSourceDto ToDto(WaterSource w) => new(
        w.Id,
        w.FarmId,
        w.Type,
        w.AvailabilityValue,
        w.AvailabilityUnit,
        w.AvailabilityProvenance?.ToString(),
        w.SeasonalAvailability,
        w.SeasonalAvailabilityProvenance?.ToString(),
        w.CapacityEstimateValue,
        w.CapacityEstimateUnit,
        w.CapacityEstimateProvenance?.ToString(),
        w.ReliabilityValue,
        w.ReliabilityProvenance?.ToString(),
        w.IrrigationMethod,
        w.IrrigationMethodProvenance?.ToString(),
        w.ServedCropZoneIdsJson,
        w.CreatedAt,
        w.UpdatedAt);
}
