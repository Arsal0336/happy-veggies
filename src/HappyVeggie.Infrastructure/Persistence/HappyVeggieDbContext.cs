using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Infrastructure.Persistence;

public sealed class HappyVeggieDbContext : DbContext, IApplicationDbContext
{
    public HappyVeggieDbContext(DbContextOptions<HappyVeggieDbContext> options)
        : base(options)
    {
    }

    public DbSet<Farmer> Farmers => Set<Farmer>();

    public DbSet<Farm> Farms => Set<Farm>();

    public DbSet<ProductionAreaType> ProductionAreaTypes => Set<ProductionAreaType>();

    public DbSet<ProductionArea> ProductionAreas => Set<ProductionArea>();

    public DbSet<CropZone> CropZones => Set<CropZone>();

    public DbSet<Crop> Crops => Set<Crop>();

    public DbSet<SeedVariety> SeedVarieties => Set<SeedVariety>();

    public DbSet<CropCompatibility> CropCompatibility => Set<CropCompatibility>();

    public DbSet<FieldNeighbourEdge> FieldNeighbourEdges => Set<FieldNeighbourEdge>();

    public DbSet<WaterSource> WaterSources => Set<WaterSource>();

    public DbSet<SoilProfile> SoilProfiles => Set<SoilProfile>();

    public DbSet<TwinSnapshot> TwinSnapshots => Set<TwinSnapshot>();

    public DbSet<FarmPlan> FarmPlans => Set<FarmPlan>();

    public DbSet<AssistantThread> AssistantThreads => Set<AssistantThread>();

    public DbSet<AssistantMessage> AssistantMessages => Set<AssistantMessage>();

    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();

    public DbSet<AdminAuditLog> AdminAuditLogs => Set<AdminAuditLog>();

    public DbSet<GovernmentCropRate> GovernmentCropRates => Set<GovernmentCropRate>();

    public DbSet<CropCycle> CropCycles => Set<CropCycle>();

    public DbSet<Alert> Alerts => Set<Alert>();

    public DbSet<FeatureFlag> FeatureFlags => Set<FeatureFlag>();

    public DbSet<LlmUsageLog> LlmUsageLogs => Set<LlmUsageLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(HappyVeggieDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
