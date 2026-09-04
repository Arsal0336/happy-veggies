using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.DigitalTwin.Services;
using HappyVeggie.Application.Economics;
using HappyVeggie.Application.GreenScore;
using HappyVeggie.Application.Compatibility;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.AI.Context;

/// <summary>
/// Builds FarmContext pack from twin + related data (Doc 04 §3.2 / GAP-031).
/// Tags each zone with productionAreaType. Marks missing data.
/// </summary>
public sealed class FarmContextBuilder
{
    private readonly IApplicationDbContext _db;
    private readonly DigitalTwinAssembler _twinAssembler;
    private readonly CompatibilityService _compatibility;
    private readonly GreenFarmScoringService _greenScore;
    private readonly EconomicsService _economics;

    public FarmContextBuilder(
        IApplicationDbContext db,
        DigitalTwinAssembler twinAssembler,
        CompatibilityService compatibility,
        GreenFarmScoringService greenScore,
        EconomicsService economics)
    {
        _db = db;
        _twinAssembler = twinAssembler;
        _compatibility = compatibility;
        _greenScore = greenScore;
        _economics = economics;
    }

    public async Task<FarmContextPack> BuildAsync(Guid farmId, CancellationToken cancellationToken)
    {
        var twin = await _twinAssembler.AssembleAsync(farmId, cancellationToken);
        var missingFlags = new List<string>();

        var farmEntity = await _db.Farms.AsNoTracking()
            .FirstAsync(f => f.Id == farmId, cancellationToken);
        var farmer = await _db.Farmers.AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == farmEntity.FarmerId, cancellationToken);

        var language = farmer?.Language ?? "en";
        var farm = new FarmIdentityContext(
            twin.Farm.Name ?? "Unnamed Farm",
            twin.Farm.RegionLabel,
            twin.Farm.RegionCode,
            twin.Farm.Lat,
            twin.Farm.Lng,
            twin.Farm.AreaAcres,
            farmEntity.SoilType,
            farmEntity.WaterAccess,
            farmEntity.WaterSource,
            language);

        var areas = twin.Areas.Select(a => new AreaContext(
            a.Name ?? a.TypeCode,
            a.TypeCode,
            a.TypeCode,
            a.AreaInputValue,
            a.AreaInputUnit,
            a.AreaCanonicalValue,
            ParseDecimal(a.TemperatureC),
            ParseDecimal(a.HumidityPercent),
            a.StructureType,
            a.GrowingMedium,
            null)).ToList();

        if (areas.Count == 0) missingFlags.Add("No production areas configured");

        var varietyIds = twin.Zones
            .Select(z => z.SeedVarietyId)
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .Select(id => id!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
        var varietyRows = varietyIds.Count == 0
            ? []
            : await _db.SeedVarieties.AsNoTracking()
                .Where(v => varietyIds.Contains(v.Id))
                .ToListAsync(cancellationToken);
        var varietyLookup = varietyRows.ToDictionary(
            v => v.Id,
            v => string.IsNullOrWhiteSpace(v.NameEn) ? v.NameUr : v.NameEn,
            StringComparer.OrdinalIgnoreCase);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var areaTypeMap = twin.Areas.ToDictionary(a => a.Id, a => a.TypeCode);
        var zones = twin.Zones.Select(z =>
        {
            string? variety = null;
            if (!string.IsNullOrWhiteSpace(z.SeedVarietyId))
            {
                varietyLookup.TryGetValue(z.SeedVarietyId, out variety);
                variety ??= z.SeedVarietyId;
            }

            int? daysSince = z.PlantingDate is { } pd
                ? today.DayNumber - pd.DayNumber
                : null;

            return new ZoneContext(
                z.Label ?? "Unnamed Zone",
                z.CropId,
                z.CropFreetext ?? z.CropId,
                variety,
                z.GrowthStage,
                z.PlantingDate?.ToString("yyyy-MM-dd"),
                daysSince,
                z.AreaInputValue,
                z.AreaInputUnit,
                z.AreaCanonicalValue,
                z.ExpectedYieldValue,
                z.ExpectedYieldUnit,
                z.ExpectedYieldProvenance,
                areaTypeMap.GetValueOrDefault(z.ProductionAreaId, "unknown"),
                z.IsExperimental);
        }).ToList();

        if (zones.Count == 0) missingFlags.Add("No crop zones defined");
        if (zones.Any(z => z.ExpectedYield is null))
            missingFlags.Add("Some crop zones are missing expected yield estimates");

        WeatherContext? weather = null;
        if (twin.Weather is not null)
        {
            weather = new WeatherContext(
                twin.Weather.TemperatureC,
                twin.Weather.HumidityPercent,
                twin.Weather.WindSpeedKmh,
                twin.Weather.RainfallMm,
                twin.Weather.Condition ?? twin.Weather.ForecastTrend,
                twin.Weather.ProviderStatus,
                twin.Weather.ObservedAt ?? twin.TwinRefreshedAt);
        }
        else missingFlags.Add("No weather data available");

        var soilRows = (await _db.SoilProfiles.AsNoTracking()
            .Where(s => s.FarmId == farmId && !s.IsDeleted)
            .ToListAsync(cancellationToken))
            .OrderByDescending(s => s.UpdatedAt)
            .ToList();

        SoilContext? soil = null;
        if (soilRows.Count > 0)
        {
            var primary = soilRows[0];
            soil = new SoilContext(
                primary.SoilType,
                primary.Texture,
                primary.PhValue,
                primary.OrganicMatterValue,
                primary.NitrogenValue,
                primary.PhosphorusValue,
                primary.PotassiumValue,
                primary.FarmerNotes,
                primary.SoilTypeProvenance?.ToString() ?? primary.TextureProvenance?.ToString());
        }
        else missingFlags.Add("No soil data available");

        var waterRows = await _db.WaterSources.AsNoTracking()
            .Where(w => w.FarmId == farmId && !w.IsDeleted)
            .ToListAsync(cancellationToken);
        var waterSources = waterRows.Select(w => new WaterContext(
            w.Type,
            w.IrrigationMethod,
            w.ReliabilityValue,
            w.SeasonalAvailability,
            w.AvailabilityValue,
            w.AvailabilityUnit,
            true)).ToList();
        if (waterSources.Count == 0) missingFlags.Add("No water source data");

        var econSnapshots = await _economics.CalculateForFarmAsync(farmId, cancellationToken);
        EconomicsContext? econ = null;
        var zoneEcon = new List<ZoneEconomicsContext>();
        if (econSnapshots.Count > 0)
        {
            econ = new EconomicsContext(
                econSnapshots.Count,
                econSnapshots.Sum(e => e.ReferenceGrossValue),
                econSnapshots.FirstOrDefault()?.Currency ?? "PKR");

            // Match snapshots back to zone labels via crop id (best-effort).
            foreach (var snap in econSnapshots)
            {
                var zone = zones.FirstOrDefault(z =>
                    string.Equals(z.CropId, snap.CropId, StringComparison.OrdinalIgnoreCase));
                zoneEcon.Add(new ZoneEconomicsContext(
                    zone?.Label ?? snap.CropId,
                    snap.CropId,
                    snap.ExpectedYield,
                    snap.YieldUnit,
                    snap.RatePerUnit,
                    snap.Currency,
                    snap.ReferenceGrossValue,
                    snap.Period));
            }
        }

        var greenResult = await _greenScore.CalculateAsync(farmId, cancellationToken);
        var green = new GreenScoreContext(greenResult.Score, greenResult.MaxScore, greenResult.Explanations);

        var warnings = await _compatibility.CheckNeighboursAsync(farmId, cancellationToken);
        var warningTexts = warnings.Select(w =>
            $"'{w.ZoneALabel}' and '{w.ZoneBLabel}': {w.Reason}").ToList();

        var zoneLabelById = twin.Zones.ToDictionary(z => z.Id, z => z.Label ?? z.Id.ToString());
        var neighbourEdges = twin.NeighbourEdges.Select(e =>
        {
            zoneLabelById.TryGetValue(e.CropZoneAId, out var a);
            zoneLabelById.TryGetValue(e.CropZoneBId, out var b);
            return $"{a ?? e.CropZoneAId.ToString()} ↔ {b ?? e.CropZoneBId.ToString()} ({e.AdjacencyType})";
        }).ToList();

        var alertRows = (await _db.Alerts.AsNoTracking()
            .Where(a => a.FarmId == farmId)
            .ToListAsync(cancellationToken))
            .OrderByDescending(a => a.CreatedAt)
            .Take(8)
            .ToList();
        var alerts = alertRows.Select(a => new AlertContext(
            a.Type, a.Severity, a.Title, a.Body, a.CreatedAt)).ToList();

        var zoneIds = twin.Zones.Select(z => z.Id).ToList();
        var cycleRows = (await _db.CropCycles.AsNoTracking()
            .Where(c => zoneIds.Contains(c.CropZoneId))
            .ToListAsync(cancellationToken))
            .OrderByDescending(c => c.UpdatedAt)
            .Take(12)
            .ToList();
        var cycles = cycleRows.Select(c =>
        {
            zoneLabelById.TryGetValue(c.CropZoneId, out var label);
            return new CropCycleContext(
                label ?? c.CropZoneId.ToString(),
                c.Season,
                c.PredictedYield,
                c.PredictedYieldUnit,
                c.ActualYield,
                c.ActualYieldUnit,
                c.Delta,
                c.Notes);
        }).ToList();
        if (cycles.Count == 0)
            missingFlags.Add("No historic crop-cycle yield records yet");

        return new FarmContextPack
        {
            Farm = farm,
            ProductionAreas = areas,
            CropZones = zones,
            Weather = weather,
            Soil = soil,
            WaterSources = waterSources,
            Economics = econ,
            ZoneEconomics = zoneEcon,
            GreenScore = green,
            CompatibilityWarnings = warningTexts,
            NeighbourEdges = neighbourEdges,
            Alerts = alerts,
            CropCycles = cycles,
            MissingDataFlags = missingFlags,
            TwinRefreshedAt = twin.TwinRefreshedAt
        };
    }

    /// <summary>
    /// Serialize context pack to compact text for LLM prompt injection.
    /// Emphasizes production area types so protected-env questions stay grounded (GAP-032).
    /// </summary>
    public static string ToPromptText(FarmContextPack ctx)
    {
        var sb = new global::System.Text.StringBuilder();
        sb.AppendLine("=== FARM CONTEXT (authoritative grounded data — USE these values; do not invent or claim they are missing when present) ===");
        sb.AppendLine(
            $"Farm: {ctx.Farm.Name} | Region: {ctx.Farm.Region} ({ctx.Farm.RegionCode ?? "n/a"}) | " +
            $"Lat/Lng: {ctx.Farm.Lat?.ToString() ?? "n/a"}, {ctx.Farm.Lng?.ToString() ?? "n/a"} | " +
            $"TotalArea: {ctx.Farm.TotalAreaAcres?.ToString() ?? "n/a"} acres | Language: {ctx.Farm.Language}");
        sb.AppendLine(
            $"Farm soilType label: {ctx.Farm.SoilTypeOnFarm ?? "n/a"} | waterAccess={ctx.Farm.WaterAccess?.ToString() ?? "n/a"} | " +
            $"farmWaterSource={ctx.Farm.WaterSourceLabel ?? "n/a"} | twinRefreshedAt={ctx.TwinRefreshedAt?.ToString("u") ?? "n/a"}");
        sb.AppendLine("IMPORTANT: Advice must respect each zone's productionAreaType (open_field vs shed/greenhouse/tunnel). Do not assume outdoor conditions for protected areas.");
        sb.AppendLine("IMPORTANT: When the farmer asks about yield, irrigation, weather, soil, or water, cite the numbers from THIS context (with provenance). Only say data is missing if it appears under Missing Data or a field is literally n/a/null.");

        if (ctx.ProductionAreas.Count > 0)
        {
            sb.AppendLine("\nProduction Areas:");
            foreach (var a in ctx.ProductionAreas)
            {
                sb.AppendLine(
                    $"  - {a.Name} (type={a.TypeCode}): area={a.AreaValue} {a.AreaUnit} " +
                    $"(canonicalAcres={a.AreaCanonicalAcres?.ToString() ?? "n/a"}), " +
                    $"microTempC={a.TemperatureC?.ToString() ?? "n/a"}, microHumidity%={a.HumidityPercent?.ToString() ?? "n/a"}, " +
                    $"structure={a.StructureType ?? "n/a"}, medium={a.GrowingMedium ?? "n/a"}");
            }
        }

        if (ctx.CropZones.Count > 0)
        {
            sb.AppendLine("\nCrop Zones (use these for Tomato block / onion / marigold questions):");
            foreach (var z in ctx.CropZones)
            {
                sb.AppendLine(
                    $"  - {z.Label}: cropId={z.CropId ?? "n/a"}, crop={z.CropName ?? "none"}, variety={z.VarietyName ?? "none"}, " +
                    $"stage={z.GrowthStage ?? "unknown"}, planted={z.PlantingDate ?? "n/a"} " +
                    $"(daysSincePlanting={z.DaysSincePlanting?.ToString() ?? "n/a"}), " +
                    $"area={z.AreaValue?.ToString() ?? "n/a"} {z.AreaUnit ?? ""} " +
                    $"(canonicalAcres={z.AreaCanonicalAcres?.ToString() ?? "n/a"}), " +
                    $"expectedYield={z.ExpectedYield?.ToString() ?? "n/a"} {z.YieldUnit ?? ""} " +
                    $"[yieldProvenance={z.YieldProvenance ?? "unknown"}], " +
                    $"productionAreaType={z.ProductionAreaType}" +
                    $"{(z.IsExperimental ? " [EXPERIMENTAL]" : "")}");
            }
        }

        if (ctx.Weather is not null)
        {
            sb.AppendLine("\nWeather (from farm twin snapshot — cite as weather_data / location twin):");
            sb.AppendLine(
                $"  tempC={ctx.Weather.TempC?.ToString() ?? "n/a"}, humidity%={ctx.Weather.Humidity?.ToString() ?? "n/a"}, " +
                $"windKmh={ctx.Weather.WindKmh?.ToString() ?? "n/a"}, rainfallMm={ctx.Weather.RainfallMm?.ToString() ?? "n/a"}, " +
                $"condition={ctx.Weather.Condition ?? "n/a"}, providerStatus={ctx.Weather.Provider ?? "n/a"}, " +
                $"observedAt={ctx.Weather.ObservedAt?.ToString("u") ?? "n/a"}");
        }

        if (ctx.Soil is not null)
        {
            sb.AppendLine("\nSoil profile (cite as soil_data):");
            sb.AppendLine(
                $"  type={ctx.Soil.SoilType ?? "n/a"}, texture={ctx.Soil.Texture ?? "n/a"}, pH={ctx.Soil.Ph?.ToString() ?? "n/a"}, " +
                $"OM%={ctx.Soil.OrganicMatter?.ToString() ?? "n/a"}, N={ctx.Soil.Nitrogen?.ToString() ?? "n/a"}, " +
                $"P={ctx.Soil.Phosphorus?.ToString() ?? "n/a"}, K={ctx.Soil.Potassium?.ToString() ?? "n/a"}, " +
                $"provenance={ctx.Soil.Provenance ?? "n/a"}");
            if (!string.IsNullOrWhiteSpace(ctx.Soil.FarmerNotes))
                sb.AppendLine($"  farmerNotes={ctx.Soil.FarmerNotes}");
        }

        if (ctx.WaterSources.Count > 0)
        {
            sb.AppendLine($"\nWater Sources ({ctx.WaterSources.Count}):");
            foreach (var w in ctx.WaterSources)
            {
                sb.AppendLine(
                    $"  - type={w.SourceType ?? "n/a"}, irrigation={w.IrrigationMethod ?? "n/a"}, " +
                    $"reliability={w.Reliability?.ToString() ?? "n/a"}, seasonal={w.SeasonalAvailability ?? "n/a"}, " +
                    $"availability={w.AvailabilityValue?.ToString() ?? "n/a"} {w.AvailabilityUnit ?? ""}");
            }
        }

        if (ctx.NeighbourEdges.Count > 0)
        {
            sb.AppendLine("\nNeighbour / companion edges:");
            foreach (var e in ctx.NeighbourEdges)
                sb.AppendLine($"  - {e}");
        }

        if (ctx.CompatibilityWarnings.Count > 0)
        {
            sb.AppendLine("\nCompatibility Warnings:");
            foreach (var w in ctx.CompatibilityWarnings)
                sb.AppendLine($"  ⚠ {w}");
        }

        if (ctx.ZoneEconomics.Count > 0)
        {
            sb.AppendLine("\nEconomics by zone (ExpectedYield × government reference rate):");
            foreach (var e in ctx.ZoneEconomics)
            {
                sb.AppendLine(
                    $"  - {e.ZoneLabel} ({e.CropId}): yield={e.ExpectedYield} {e.YieldUnit}, " +
                    $"rate={e.RatePerUnit} {e.Currency}/{e.YieldUnit}, gross≈{e.ReferenceGrossValue} {e.Currency} (period {e.Period})");
            }
        }
        else if (ctx.Economics is not null)
        {
            sb.AppendLine($"\nEconomics summary: {ctx.Economics.ZonesWithRates} zones with rates, est. gross value {ctx.Economics.TotalGrossValue} {ctx.Economics.Currency}");
        }

        if (ctx.CropCycles.Count > 0)
        {
            sb.AppendLine("\nHistoric crop cycles (predicted vs actual yield when available):");
            foreach (var c in ctx.CropCycles)
            {
                sb.AppendLine(
                    $"  - {c.ZoneLabel} / {c.Season}: predicted={c.PredictedYield?.ToString() ?? "n/a"} {c.PredictedYieldUnit ?? ""}, " +
                    $"actual={c.ActualYield?.ToString() ?? "n/a"} {c.ActualYieldUnit ?? ""}, delta={c.Delta?.ToString() ?? "n/a"}" +
                    $"{(string.IsNullOrWhiteSpace(c.Notes) ? "" : $", notes={c.Notes}")}");
            }
        }

        if (ctx.Alerts.Count > 0)
        {
            sb.AppendLine("\nRecent farm alerts:");
            foreach (var a in ctx.Alerts)
                sb.AppendLine($"  - [{a.Severity}/{a.Type}] {a.Title}: {a.Body} ({a.CreatedAt:u})");
        }

        if (ctx.GreenScore is not null)
        {
            sb.AppendLine($"\nGreen Score: {ctx.GreenScore.Score}/{ctx.GreenScore.MaxScore}");
            foreach (var f in ctx.GreenScore.Factors.Take(6))
                sb.AppendLine($"  - {f}");
        }

        if (ctx.MissingDataFlags.Count > 0)
        {
            sb.AppendLine("\nMissing Data (only these may be described as unavailable):");
            foreach (var f in ctx.MissingDataFlags)
                sb.AppendLine($"  ⚠ {f}");
        }

        sb.AppendLine("=== END FARM CONTEXT ===");
        return sb.ToString();
    }

    private static decimal? ParseDecimal(string? value)
        => decimal.TryParse(value, out var d) ? d : null;
}
