using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.DigitalTwin.Services;
using HappyVeggie.Application.Economics;
using HappyVeggie.Application.GreenScore;
using HappyVeggie.Application.Compatibility;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.AI.Context;

/// <summary>
/// Builds FarmContext pack from twin + related data (Doc 04 §3.2).
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

        // Get farm + farmer for language
        var farmEntity = await _db.Farms.AsNoTracking()
            .FirstAsync(f => f.Id == farmId, cancellationToken);
        var farmer = await _db.Farmers.AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == farmEntity.FarmerId, cancellationToken);

        var farm = new FarmIdentityContext(
            twin.Farm.Name ?? "Unnamed Farm", twin.Farm.RegionLabel,
            twin.Farm.Lat, twin.Farm.Lng,
            twin.Farm.AreaAcres, farmer?.Language ?? "en");

        // Production areas
        var areas = twin.Areas.Select(a => new AreaContext(
            a.Name ?? a.TypeCode, a.TypeCode, a.TypeCode,
            a.AreaCanonicalValue, a.AreaInputUnit,
            null)).ToList();

        if (areas.Count == 0) missingFlags.Add("No production areas configured");

        // Crop zones with productionAreaType tag
        var areaTypeMap = twin.Areas.ToDictionary(a => a.Id, a => a.TypeCode);
        var zones = twin.Zones.Select(z => new ZoneContext(
            z.Label ?? "Unnamed Zone", z.CropId, z.SeedVarietyId,
            z.GrowthStage, z.PlantingDate?.ToString("yyyy-MM-dd"),
            z.ExpectedYieldValue, z.ExpectedYieldUnit,
            areaTypeMap.GetValueOrDefault(z.ProductionAreaId, "unknown"),
            z.IsExperimental)).ToList();

        if (zones.Count == 0) missingFlags.Add("No crop zones defined");

        // Weather
        WeatherContext? weather = null;
        if (twin.Weather is not null)
        {
            weather = new WeatherContext(null, null, null, null, null, twin.Weather.ProviderStatus, null);
        }
        else missingFlags.Add("No weather data available");

        // Soil
        SoilContext? soil = null;
        if (twin.SoilSummary is not null && twin.SoilSummary.ProfileCount > 0)
        {
            soil = new SoilContext(null, null, null, null, null);
        }
        else missingFlags.Add("No soil data available");

        // Water
        var waterSources = new List<WaterContext>();
        if (twin.WaterSummary is not null)
        {
            foreach (var ws in twin.WaterSummary.Sources)
                waterSources.Add(new WaterContext(ws.Type, null, null));
        }
        else missingFlags.Add("No water source data");

        // Economics
        EconomicsContext? econ = null;
        var econSnapshots = await _economics.CalculateForFarmAsync(farmId, cancellationToken);
        if (econSnapshots.Count > 0)
        {
            econ = new EconomicsContext(
                econSnapshots.Count,
                econSnapshots.Sum(e => e.ReferenceGrossValue),
                econSnapshots.FirstOrDefault()?.Currency ?? "PKR");
        }

        // Green score
        var greenResult = await _greenScore.CalculateAsync(farmId, cancellationToken);
        var green = new GreenScoreContext(greenResult.Score, greenResult.MaxScore, greenResult.Explanations);

        // Compatibility warnings
        var warnings = await _compatibility.CheckNeighboursAsync(farmId, cancellationToken);
        var warningTexts = warnings.Select(w =>
            $"'{w.ZoneALabel}' and '{w.ZoneBLabel}': {w.Reason}").ToList();

        return new FarmContextPack
        {
            Farm = farm,
            ProductionAreas = areas,
            CropZones = zones,
            Weather = weather,
            Soil = soil,
            WaterSources = waterSources,
            Economics = econ,
            GreenScore = green,
            CompatibilityWarnings = warningTexts,
            MissingDataFlags = missingFlags
        };
    }

    /// <summary>
    /// Serialize context pack to compact text for LLM prompt injection.
    /// </summary>
    public static string ToPromptText(FarmContextPack ctx)
    {
        var sb = new global::System.Text.StringBuilder();
        sb.AppendLine("=== FARM CONTEXT (grounded data — do not fabricate beyond this) ===");
        sb.AppendLine($"Farm: {ctx.Farm.Name} | Region: {ctx.Farm.Region} | Area: {ctx.Farm.TotalAreaAcres} acres | Language: {ctx.Farm.Language}");

        if (ctx.ProductionAreas.Count > 0)
        {
            sb.AppendLine("\nProduction Areas:");
            foreach (var a in ctx.ProductionAreas)
                sb.AppendLine($"  - {a.Name} ({a.TypeCode}): {a.AreaValue} {a.AreaUnit} [provenance: {a.Provenance ?? "unknown"}]");
        }

        if (ctx.CropZones.Count > 0)
        {
            sb.AppendLine("\nCrop Zones:");
            foreach (var z in ctx.CropZones)
                sb.AppendLine($"  - {z.Label}: crop={z.CropName ?? "none"}, variety={z.VarietyName ?? "none"}, stage={z.GrowthStage ?? "unknown"}, type={z.ProductionAreaType}{(z.IsExperimental ? " [EXPERIMENTAL]" : "")}");
        }

        if (ctx.Weather is not null)
            sb.AppendLine($"\nWeather: {ctx.Weather.TempC}°C, Humidity {ctx.Weather.Humidity}%, Wind {ctx.Weather.WindKmh}km/h, Rain {ctx.Weather.RainfallMm}mm ({ctx.Weather.Condition})");

        if (ctx.Soil is not null)
            sb.AppendLine($"\nSoil: Type={ctx.Soil.SoilType}, Texture={ctx.Soil.Texture}, pH={ctx.Soil.Ph}, OM={ctx.Soil.OrganicMatter}%");

        if (ctx.WaterSources.Count > 0)
        {
            sb.AppendLine("\nWater Sources:");
            foreach (var w in ctx.WaterSources)
                sb.AppendLine($"  - {w.Name} ({w.SourceType})");
        }

        if (ctx.Economics is not null)
            sb.AppendLine($"\nEconomics: {ctx.Economics.ZonesWithRates} zones with rates, est. gross value {ctx.Economics.TotalGrossValue} {ctx.Economics.Currency}");

        if (ctx.GreenScore is not null)
            sb.AppendLine($"\nGreen Score: {ctx.GreenScore.Score}/{ctx.GreenScore.MaxScore}");

        if (ctx.CompatibilityWarnings.Count > 0)
        {
            sb.AppendLine("\nCompatibility Warnings:");
            foreach (var w in ctx.CompatibilityWarnings)
                sb.AppendLine($"  ⚠ {w}");
        }

        if (ctx.MissingDataFlags.Count > 0)
        {
            sb.AppendLine("\nMissing Data:");
            foreach (var f in ctx.MissingDataFlags)
                sb.AppendLine($"  ⚠ {f}");
        }

        sb.AppendLine("=== END FARM CONTEXT ===");
        return sb.ToString();
    }
}
