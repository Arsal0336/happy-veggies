namespace HappyVeggie.Application.Water.Dtos;

public sealed record WaterSourceDto(
    Guid Id,
    Guid FarmId,
    string Type,
    decimal? AvailabilityValue,
    string? AvailabilityUnit,
    string? AvailabilityProvenance,
    string? SeasonalAvailability,
    string? SeasonalAvailabilityProvenance,
    decimal? CapacityEstimateValue,
    string? CapacityEstimateUnit,
    string? CapacityEstimateProvenance,
    decimal? ReliabilityValue,
    string? ReliabilityProvenance,
    string? IrrigationMethod,
    string? IrrigationMethodProvenance,
    string? ServedCropZoneIdsJson,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
