using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using HappyVeggie.Domain.Entities;
using HappyVeggie.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Infrastructure.Persistence;

public static class DemoDataSeeder
{
    public const string AdminEmail = "admin@happyveggie.pk";
    public const string AdminPassword = "HappyVeggie!2026";
    public const string DemoFarmerPhone = "+923001234567";
    public const string DemoOtp = "1234";

    private static readonly Guid AdminId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0001");
    private static readonly Guid FarmerId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0002");
    private static readonly Guid FarmId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0003");
    private static readonly Guid AreaId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0004");
    private static readonly Guid ZoneTomatoId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0005");
    private static readonly Guid ZoneOnionId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0006");
    private static readonly Guid ZoneMarigoldId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0007");
    private static readonly Guid WaterId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0008");
    private static readonly Guid SoilId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0009");
    private static readonly Guid TwinId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee000a");
    private static readonly Guid PlanId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee000b");
    private static readonly Guid EdgeTomatoOnionId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee000c");
    private static readonly Guid EdgeTomatoMarigoldId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee000d");
    private static readonly Guid AlertHeatId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee000e");
    private static readonly Guid AlertIrrigId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee000f");
    private static readonly Guid AlertCompatId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0010");

    public static async Task SeedAsync(HappyVeggieDbContext db, CancellationToken cancellationToken = default)
    {
        await SeedAdminAsync(db, cancellationToken);
        await SeedDemoFarmerAsync(db, cancellationToken);
        await SeedDemoFarmAsync(db, cancellationToken);
        await SeedDemoEnrichmentAsync(db, cancellationToken);
        await SeedGovernmentRatesAsync(db, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
    }

    public static string HashPassword(string password)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hash);
    }

    private static async Task SeedAdminAsync(HappyVeggieDbContext db, CancellationToken cancellationToken)
    {
        var exists = await db.AdminUsers.AnyAsync(a => a.Email == AdminEmail, cancellationToken);
        if (exists)
        {
            return;
        }

        db.AdminUsers.Add(new AdminUser
        {
            Id = AdminId,
            Email = AdminEmail,
            PasswordHash = HashPassword(AdminPassword),
            Role = "Admin",
            MfaEnabled = false,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        });
    }

    private static async Task SeedDemoFarmerAsync(HappyVeggieDbContext db, CancellationToken cancellationToken)
    {
        var exists = await db.Farmers.AnyAsync(f => f.Phone == DemoFarmerPhone, cancellationToken);
        if (exists)
        {
            return;
        }

        var now = DateTimeOffset.UtcNow;
        db.Farmers.Add(new Farmer
        {
            Id = FarmerId,
            Phone = DemoFarmerPhone,
            Name = "Demo Farmer",
            Language = "en",
            CreatedAt = now,
            UpdatedAt = now
        });
    }

    private static async Task SeedDemoFarmAsync(HappyVeggieDbContext db, CancellationToken cancellationToken)
    {
        var farmExists = await db.Farms.AnyAsync(f => f.Id == FarmId || f.FarmerId == FarmerId, cancellationToken);
        if (!farmExists)
        {
            var now = DateTimeOffset.UtcNow;
            db.Farms.Add(new Farm
            {
                Id = FarmId,
                FarmerId = FarmerId,
                Name = "Green Valley Farm",
                Lat = 33.6844m,
                Lng = 73.0479m,
                RegionCode = "ISB",
                RegionLabel = "Islamabad",
                AreaAcres = 5m,
                AreaInputValue = 5m,
                AreaInputUnit = "acres",
                SoilType = "loam",
                WaterAccess = true,
                WaterSource = "tube_well",
                PreferredCropFreeText = "tomato",
                IsNewFarmSetup = false,
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        var areaExists = await db.ProductionAreas.AnyAsync(a => a.Id == AreaId || a.FarmId == FarmId, cancellationToken);
        if (!areaExists)
        {
            var now = DateTimeOffset.UtcNow;
            db.ProductionAreas.Add(new ProductionArea
            {
                Id = AreaId,
                FarmId = FarmId,
                TypeCode = "open_field",
                Name = "Main Open Field",
                AreaInputValue = 5m,
                AreaInputUnit = "acres",
                AreaCanonicalValue = 5m,
                CreatedAt = now,
                UpdatedAt = now
            });
        }
    }

    /// <summary>
    /// Idempotent enrichment so existing demo DBs pick up zones/twin/plan/alerts on next API start.
    /// </summary>
    private static async Task SeedDemoEnrichmentAsync(HappyVeggieDbContext db, CancellationToken cancellationToken)
    {
        var farm = await db.Farms.FirstOrDefaultAsync(f => f.Id == FarmId && !f.IsDeleted, cancellationToken);
        if (farm is null)
        {
            return;
        }

        var areaId = await db.ProductionAreas
            .Where(a => a.FarmId == FarmId && !a.IsDeleted)
            .Select(a => a.Id)
            .FirstOrDefaultAsync(cancellationToken);
        if (areaId == Guid.Empty)
        {
            return;
        }

        var now = DateTimeOffset.UtcNow;

        if (!await db.CropZones.AnyAsync(z => z.FarmId == FarmId && !z.IsDeleted, cancellationToken))
        {
            db.CropZones.AddRange(
                new CropZone
                {
                    Id = ZoneTomatoId,
                    FarmId = FarmId,
                    ProductionAreaId = areaId,
                    Label = "Tomato block A",
                    AreaInputValue = 2m,
                    AreaInputUnit = "acres",
                    AreaCanonicalValue = 2m,
                    CropId = "tomato",
                    CropFreetext = "Tomato",
                    GrowthStage = "vegetative",
                    PlantingDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-35)),
                    ExpectedYieldValue = 18m,
                    ExpectedYieldUnit = "t/acre",
                    ExpectedYieldProvenance = DataProvenance.ThirdPartyEstimate,
                    IsExperimental = false,
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new CropZone
                {
                    Id = ZoneOnionId,
                    FarmId = FarmId,
                    ProductionAreaId = areaId,
                    Label = "Onion strip",
                    AreaInputValue = 1.5m,
                    AreaInputUnit = "acres",
                    AreaCanonicalValue = 1.5m,
                    CropId = "onion",
                    CropFreetext = "Onion",
                    GrowthStage = "establishment",
                    PlantingDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-20)),
                    ExpectedYieldValue = 12m,
                    ExpectedYieldUnit = "t/acre",
                    ExpectedYieldProvenance = DataProvenance.ThirdPartyEstimate,
                    IsExperimental = false,
                    CreatedAt = now,
                    UpdatedAt = now
                },
                new CropZone
                {
                    Id = ZoneMarigoldId,
                    FarmId = FarmId,
                    ProductionAreaId = areaId,
                    Label = "Marigold border",
                    AreaInputValue = 0.5m,
                    AreaInputUnit = "acres",
                    AreaCanonicalValue = 0.5m,
                    CropId = "marigold",
                    CropFreetext = "Marigold",
                    GrowthStage = "flowering",
                    PlantingDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-45)),
                    IsExperimental = true,
                    CreatedAt = now,
                    UpdatedAt = now
                });
        }

        if (!await db.FieldNeighbourEdges.AnyAsync(e => e.FarmId == FarmId, cancellationToken))
        {
            var tomatoId = await ResolveZoneIdAsync(db, FarmId, "tomato", ZoneTomatoId, cancellationToken);
            var onionId = await ResolveZoneIdAsync(db, FarmId, "onion", ZoneOnionId, cancellationToken);
            var marigoldId = await ResolveZoneIdAsync(db, FarmId, "marigold", ZoneMarigoldId, cancellationToken);

            db.FieldNeighbourEdges.AddRange(
                new FieldNeighbourEdge
                {
                    Id = EdgeTomatoOnionId,
                    FarmId = FarmId,
                    CropZoneAId = tomatoId,
                    CropZoneBId = onionId,
                    AdjacencyType = "adjacent",
                    Source = "demo_seed",
                    Enabled = true
                },
                new FieldNeighbourEdge
                {
                    Id = EdgeTomatoMarigoldId,
                    FarmId = FarmId,
                    CropZoneAId = tomatoId,
                    CropZoneBId = marigoldId,
                    AdjacencyType = "adjacent",
                    Source = "demo_seed",
                    Enabled = true
                });
        }

        if (!await db.WaterSources.AnyAsync(w => w.FarmId == FarmId && !w.IsDeleted, cancellationToken))
        {
            db.WaterSources.Add(new WaterSource
            {
                Id = WaterId,
                FarmId = FarmId,
                Type = "tube_well",
                AvailabilityValue = 1,
                AvailabilityUnit = "source",
                AvailabilityProvenance = DataProvenance.FarmerProvided,
                SeasonalAvailability = "reliable year-round",
                SeasonalAvailabilityProvenance = DataProvenance.FarmerProvided,
                ReliabilityValue = 0.85m,
                ReliabilityProvenance = DataProvenance.ThirdPartyEstimate,
                IrrigationMethod = "furrow",
                IrrigationMethodProvenance = DataProvenance.FarmerProvided,
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        if (!await db.SoilProfiles.AnyAsync(s => s.FarmId == FarmId && !s.IsDeleted, cancellationToken))
        {
            db.SoilProfiles.Add(new SoilProfile
            {
                Id = SoilId,
                FarmId = FarmId,
                ProductionAreaId = areaId,
                SoilType = "loam",
                SoilTypeProvenance = DataProvenance.ThirdPartyEstimate,
                Texture = "sandy loam",
                TextureProvenance = DataProvenance.ThirdPartyEstimate,
                PhValue = 6.8m,
                PhValueProvenance = DataProvenance.ThirdPartyEstimate,
                OrganicMatterValue = 1.8m,
                OrganicMatterProvenance = DataProvenance.ThirdPartyEstimate,
                NitrogenValue = 42m,
                NitrogenProvenance = DataProvenance.ThirdPartyEstimate,
                PhosphorusValue = 18m,
                PhosphorusProvenance = DataProvenance.ThirdPartyEstimate,
                PotassiumValue = 160m,
                PotassiumProvenance = DataProvenance.ThirdPartyEstimate,
                FarmerNotes = "Demo soil profile for Green Valley Farm (Islamabad).",
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        if (!await db.TwinSnapshots.AnyAsync(t => t.FarmId == FarmId, cancellationToken))
        {
            var twinJson = JsonSerializer.Serialize(new
            {
                weather = new
                {
                    status = "stub",
                    temperatureC = 28.5m,
                    humidityPercent = 48m,
                    windSpeedKmh = 12m,
                    rainfallMm = 2m,
                    condition = "Partly cloudy",
                    providerName = "regional-estimate",
                    observedAt = now
                },
                soil = new
                {
                    status = "stub",
                    soilType = "loam",
                    texture = "sandy loam",
                    phLevel = 6.8m,
                    organicMatterPercent = 1.8m,
                    providerName = "regional-estimate"
                }
            });

            db.TwinSnapshots.Add(new TwinSnapshot
            {
                Id = TwinId,
                FarmId = FarmId,
                TwinJson = twinJson,
                RefreshedAt = now,
                WeatherProviderStatus = "stub",
                SoilProviderStatus = "stub",
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        if (!await db.FarmPlans.AnyAsync(p => p.FarmId == FarmId, cancellationToken))
        {
            var content = JsonSerializer.Serialize(new
            {
                planSections = new object[]
                {
                    new
                    {
                        sectionId = "overview",
                        title = "Farm overview",
                        content = "Green Valley Farm (Islamabad) is ready for a tomato-led cycle with onion companion and marigold border. Refresh the twin before major irrigation decisions.",
                        recommendations = new[] { "Keep tomato as the commercial lead", "Ask the assistant after any heat alert" }
                    },
                    new
                    {
                        sectionId = "water",
                        title = "Water and irrigation",
                        content = "Furrow irrigate tomato early morning. Skip a cycle if twin rainfall exceeds 8 mm. Tube-well reliability is strong this season.",
                        recommendations = new[] { "Irrigate before 9am", "Log each irrigation on the water page" }
                    },
                    new
                    {
                        sectionId = "recommendations",
                        title = "Next actions",
                        content = "Scout tomato for early blight, keep marigold borders intact, and regenerate the plan after adding a new zone.",
                        recommendations = new[] { "Open alerts for heat advisory", "Review Green Farm Score" }
                    }
                },
                language = "en",
                disclaimer = "AI-generated plan. Not professional agricultural advice. Verify with local agricultural experts.",
                generatedAt = now.ToString("o")
            });

            db.FarmPlans.Add(new FarmPlan
            {
                Id = PlanId,
                FarmId = FarmId,
                FarmerId = FarmerId,
                Language = "en",
                ContentJson = content,
                ContextUsedJson = "{\"seed\":\"demo\",\"region\":\"Islamabad\",\"crops\":[\"tomato\",\"onion\",\"marigold\"]}",
                Version = 1,
                CreatedAt = now,
                ReviewStatus = "none"
            });
        }

        if (!await db.Alerts.AnyAsync(a => a.FarmId == FarmId, cancellationToken))
        {
            db.Alerts.AddRange(
                new Alert
                {
                    Id = AlertHeatId,
                    FarmId = FarmId,
                    Type = "weather",
                    Severity = "warning",
                    Title = "Heat advisory",
                    Body = "Afternoon temperatures near 34°C. Irrigate tomato in the cool hours and avoid midday spraying.",
                    IsRead = false,
                    CreatedAt = now.AddHours(-6),
                    SourceSignal = "demo_heat_advisory"
                },
                new Alert
                {
                    Id = AlertIrrigId,
                    FarmId = FarmId,
                    Type = "water",
                    Severity = "info",
                    Title = "Irrigation window",
                    Body = "Furrow irrigation recommended this evening for Tomato block A based on twin rainfall of 2 mm.",
                    IsRead = false,
                    CreatedAt = now.AddHours(-3),
                    SourceSignal = "demo_irrigation_window"
                },
                new Alert
                {
                    Id = AlertCompatId,
                    FarmId = FarmId,
                    Type = "compatibility",
                    Severity = "info",
                    Title = "Neighbour tip",
                    Body = "Tomato next to marigold is a beneficial border pairing. Keep onion strip as a compatible neighbour.",
                    IsRead = true,
                    CreatedAt = now.AddDays(-1),
                    SourceSignal = "demo_neighbour_tip"
                });
        }
    }

    private static async Task<Guid> ResolveZoneIdAsync(
        HappyVeggieDbContext db,
        Guid farmId,
        string cropId,
        Guid preferredId,
        CancellationToken cancellationToken)
    {
        var preferred = await db.CropZones
            .Where(z => z.Id == preferredId && z.FarmId == farmId && !z.IsDeleted)
            .Select(z => z.Id)
            .FirstOrDefaultAsync(cancellationToken);
        if (preferred != Guid.Empty)
        {
            return preferred;
        }

        var byCrop = await db.CropZones
            .Where(z => z.FarmId == farmId && !z.IsDeleted && z.CropId == cropId)
            .Select(z => z.Id)
            .FirstOrDefaultAsync(cancellationToken);
        return byCrop != Guid.Empty ? byCrop : preferredId;
    }

    private static async Task SeedGovernmentRatesAsync(HappyVeggieDbContext db, CancellationToken cancellationToken)
    {
        if (await db.GovernmentCropRates.AnyAsync(cancellationToken))
        {
            return;
        }

        var now = DateTimeOffset.UtcNow;
        var period = $"{now.Year}-Q{((now.Month - 1) / 3) + 1}";
        var rows = new (string CropId, decimal Rate)[]
        {
            ("tomato", 85m),
            ("potato", 55m),
            ("onion", 70m),
            ("cucumber", 60m),
            ("capsicum", 120m)
        };

        foreach (var (cropId, rate) in rows)
        {
            db.GovernmentCropRates.Add(new GovernmentCropRate
            {
                Id = Guid.NewGuid(),
                CropId = cropId,
                Unit = "kg",
                RatePerUnit = rate,
                Currency = "PKR",
                Period = period,
                SourceLabel = "Demo government reference rates",
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            });
        }
    }
}
