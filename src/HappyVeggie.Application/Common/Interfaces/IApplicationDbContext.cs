using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Farmer> Farmers { get; }
    DbSet<Farm> Farms { get; }
    DbSet<ProductionAreaType> ProductionAreaTypes { get; }
    DbSet<ProductionArea> ProductionAreas { get; }
    DbSet<CropZone> CropZones { get; }
    DbSet<Crop> Crops { get; }
    DbSet<SeedVariety> SeedVarieties { get; }
    DbSet<CropCompatibility> CropCompatibility { get; }
    DbSet<FieldNeighbourEdge> FieldNeighbourEdges { get; }
    DbSet<WaterSource> WaterSources { get; }
    DbSet<SoilProfile> SoilProfiles { get; }
    DbSet<TwinSnapshot> TwinSnapshots { get; }
    DbSet<FarmPlan> FarmPlans { get; }
    DbSet<AssistantThread> AssistantThreads { get; }
    DbSet<AssistantMessage> AssistantMessages { get; }
    DbSet<AdminUser> AdminUsers { get; }
    DbSet<AdminAuditLog> AdminAuditLogs { get; }
    DbSet<GovernmentCropRate> GovernmentCropRates { get; }
    DbSet<CropCycle> CropCycles { get; }
    DbSet<Alert> Alerts { get; }
    DbSet<FeatureFlag> FeatureFlags { get; }
    DbSet<LlmUsageLog> LlmUsageLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
