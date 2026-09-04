using HappyVeggie.Application.Water.Dtos;
using MediatR;

namespace HappyVeggie.Application.Water.CreateWaterSource;

public sealed record CreateWaterSourceCommand(
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
    string? ServedCropZoneIdsJson) : IRequest<WaterSourceDto>;
