using System.Text.Json;
using HappyVeggie.Application.Alerts;
using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Options;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.DigitalTwin.Dtos;
using HappyVeggie.Application.DigitalTwin.Services;
using HappyVeggie.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace HappyVeggie.Application.DigitalTwin.RefreshTwin;

public sealed class RefreshTwinCommandHandler : IRequestHandler<RefreshTwinCommand, FarmTwinDto>
{
    private readonly FarmOwnershipGuard _ownershipGuard;
    private readonly DigitalTwinAssembler _assembler;
    private readonly IApplicationDbContext _db;
    private readonly IWeatherProvider _weatherProvider;
    private readonly ISoilProvider _soilProvider;
    private readonly IFeatureFlagService _featureFlags;
    private readonly AlertEvaluationService _alertEvaluation;
    private readonly TimeSpan _providerTimeout;

    public RefreshTwinCommandHandler(
        FarmOwnershipGuard ownershipGuard,
        DigitalTwinAssembler assembler,
        IApplicationDbContext db,
        IWeatherProvider weatherProvider,
        ISoilProvider soilProvider,
        IFeatureFlagService featureFlags,
        AlertEvaluationService alertEvaluation,
        IOptions<ProviderOptions> providerOptions)
    {
        _ownershipGuard = ownershipGuard;
        _assembler = assembler;
        _db = db;
        _weatherProvider = weatherProvider;
        _soilProvider = soilProvider;
        _featureFlags = featureFlags;
        _alertEvaluation = alertEvaluation;
        var seconds = providerOptions.Value.TimeoutSeconds;
        _providerTimeout = TimeSpan.FromSeconds(Math.Clamp(seconds <= 0 ? 5 : seconds, 1, 60));
    }

    public async Task<FarmTwinDto> Handle(RefreshTwinCommand request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        var farm = await _db.Farms
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == request.FarmId && !f.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException($"Farm {request.FarmId} not found.");

        // Flags document enrichment intent; providers are always invoked so stub wiring is verified (EIR-005).
        _ = await _featureFlags.GetBoolAsync("weather.enrichment", defaultValue: false, cancellationToken);
        _ = await _featureFlags.GetBoolAsync("soil.enrichment", defaultValue: false, cancellationToken);

        var (weather, weatherStatus) = await TryGetWeatherAsync(farm.Lat, farm.Lng, cancellationToken);
        var (soil, soilStatus) = await TryGetSoilAsync(farm.Lat, farm.Lng, cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var twinJson = BuildTwinJson(weather, weatherStatus, soil, soilStatus);

        var snapshot = await _db.TwinSnapshots
            .FirstOrDefaultAsync(t => t.FarmId == request.FarmId, cancellationToken);

        if (snapshot is null)
        {
            snapshot = new TwinSnapshot
            {
                Id = Guid.NewGuid(),
                FarmId = request.FarmId,
                TwinJson = twinJson,
                RefreshedAt = now,
                CreatedAt = now,
                UpdatedAt = now,
                WeatherProviderStatus = weatherStatus,
                SoilProviderStatus = soilStatus
            };
            _db.TwinSnapshots.Add(snapshot);
        }
        else
        {
            snapshot.TwinJson = twinJson;
            snapshot.RefreshedAt = now;
            snapshot.UpdatedAt = now;
            snapshot.WeatherProviderStatus = weatherStatus;
            snapshot.SoilProviderStatus = soilStatus;
        }

        await _db.SaveChangesAsync(cancellationToken);

        // GAP-050: evaluate alerts after twin persist; never blocks twin (try/catch inside).
        await _alertEvaluation.EvaluateAfterTwinRefreshAsync(
            request.FarmId, weatherStatus, weather?.TemperatureC, cancellationToken);

        return await _assembler.AssembleAsync(request.FarmId, cancellationToken);
    }

    private async Task<(WeatherData? Data, string Status)> TryGetWeatherAsync(
        decimal lat, decimal lng, CancellationToken cancellationToken)
    {
        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(_providerTimeout);
            var data = await _weatherProvider.GetCurrentWeatherAsync(lat, lng, cts.Token);
            return (data, ResolveStatus(data?.ProviderName, data is not null));
        }
        catch
        {
            // EIR-005 / GAP-073: timeout or provider failure must not fail twin refresh.
            return (null, "failed");
        }
    }

    private async Task<(SoilEstimate? Data, string Status)> TryGetSoilAsync(
        decimal lat, decimal lng, CancellationToken cancellationToken)
    {
        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(_providerTimeout);
            var data = await _soilProvider.GetSoilEstimateAsync(lat, lng, cts.Token);
            return (data, ResolveStatus(data?.ProviderName, data is not null));
        }
        catch
        {
            return (null, "failed");
        }
    }

    private static string ResolveStatus(string? providerName, bool hasData)
    {
        if (!hasData)
            return "failed";

        if (string.Equals(providerName, "stub", StringComparison.OrdinalIgnoreCase))
            return "stub";

        return "success";
    }

    private static string BuildTwinJson(
        WeatherData? weather,
        string weatherStatus,
        SoilEstimate? soil,
        string soilStatus)
    {
        var payload = new
        {
            weather = weather is null
                ? new { status = weatherStatus }
                : (object)new
                {
                    status = weatherStatus,
                    temperatureC = weather.TemperatureC,
                    humidityPercent = weather.HumidityPercent,
                    windSpeedKmh = weather.WindSpeedKmh,
                    rainfallMm = weather.RainfallMm,
                    condition = weather.Condition,
                    providerName = weather.ProviderName,
                    observedAt = weather.ObservedAt
                },
            soil = soil is null
                ? new { status = soilStatus }
                : (object)new
                {
                    status = soilStatus,
                    soilType = soil.SoilType,
                    texture = soil.Texture,
                    phLevel = soil.PhLevel,
                    organicMatterPercent = soil.OrganicMatterPercent,
                    providerName = soil.ProviderName
                }
        };

        return JsonSerializer.Serialize(payload);
    }
}
