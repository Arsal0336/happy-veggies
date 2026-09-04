using System.Security.Cryptography;
using System.Text;
using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Infrastructure.Persistence;

public static class DemoDataSeeder
{
    public const string AdminEmail = "admin@happyveggie.pk";
    public const string AdminPassword = "HappyVeggie!2026";
    public const string DemoFarmerPhone = "+923001234567";
    public const string DemoOtp = "1234";

    public static async Task SeedAsync(HappyVeggieDbContext db, CancellationToken cancellationToken = default)
    {
        await SeedAdminAsync(db, cancellationToken);
        await SeedDemoFarmerAsync(db, cancellationToken);
        await SeedDemoFarmAsync(db, cancellationToken);
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
            Id = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0001"),
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
            Id = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0002"),
            Phone = DemoFarmerPhone,
            Name = "Demo Farmer",
            Language = "en",
            CreatedAt = now,
            UpdatedAt = now
        });
    }

    private static async Task SeedDemoFarmAsync(HappyVeggieDbContext db, CancellationToken cancellationToken)
    {
        var farmerId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0002");
        var farmId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0003");
        var exists = await db.Farms.AnyAsync(f => f.Id == farmId || f.FarmerId == farmerId, cancellationToken);
        if (exists)
        {
            return;
        }

        var now = DateTimeOffset.UtcNow;
        db.Farms.Add(new Farm
        {
            Id = farmId,
            FarmerId = farmerId,
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

        db.ProductionAreas.Add(new ProductionArea
        {
            Id = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0004"),
            FarmId = farmId,
            TypeCode = "open_field",
            Name = "Open Field",
            AreaInputValue = 5m,
            AreaInputUnit = "acres",
            AreaCanonicalValue = 5m,
            CreatedAt = now,
            UpdatedAt = now
        });
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
