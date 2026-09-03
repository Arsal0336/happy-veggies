using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyVeggie.Infrastructure.Persistence.Configurations;

public sealed class CropZoneConfiguration : IEntityTypeConfiguration<CropZone>
{
    public void Configure(EntityTypeBuilder<CropZone> builder)
    {
        builder.ToTable("CropZones");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.FarmId)
            .IsRequired();

        builder.Property(x => x.ProductionAreaId)
            .IsRequired();

        builder.Property(x => x.Label)
            .HasMaxLength(120);

        builder.Property(x => x.AreaInputValue)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(x => x.AreaInputUnit)
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(x => x.AreaCanonicalValue)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(x => x.CropId)
            .HasMaxLength(64);

        builder.Property(x => x.CropFreetext)
            .HasMaxLength(120);

        builder.Property(x => x.SeedVarietyId)
            .HasMaxLength(64);

        builder.Property(x => x.GrowthStage)
            .HasMaxLength(64);

        builder.Property(x => x.ExpectedYieldValue)
            .HasPrecision(18, 4);

        builder.Property(x => x.ExpectedYieldUnit)
            .HasMaxLength(32);

        builder.Property(x => x.IsExperimental)
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(x => x.IsDeleted)
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .IsRequired();

        builder.HasIndex(x => x.FarmId);
        builder.HasIndex(x => x.ProductionAreaId);
        builder.HasIndex(x => new { x.FarmId, x.ProductionAreaId });

        builder.HasOne(x => x.Farm)
            .WithMany() // navigation not modeled on Farm yet for CropZones
            .HasForeignKey(x => x.FarmId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ProductionArea)
            .WithMany() // navigation not modeled on ProductionArea yet for CropZones
            .HasForeignKey(x => x.ProductionAreaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
