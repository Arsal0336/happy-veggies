using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyVeggie.Infrastructure.Persistence.Configurations;

public sealed class WaterSourceConfiguration : IEntityTypeConfiguration<WaterSource>
{
    public void Configure(EntityTypeBuilder<WaterSource> builder)
    {
        builder.ToTable("WaterSources");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.FarmId)
            .IsRequired();

        builder.Property(x => x.Type)
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(x => x.AvailabilityValue)
            .HasPrecision(18, 4);

        builder.Property(x => x.CapacityEstimateValue)
            .HasPrecision(18, 4);

        builder.Property(x => x.ReliabilityValue)
            .HasPrecision(10, 4);

        builder.Property(x => x.AvailabilityUnit)
            .HasMaxLength(16);

        builder.Property(x => x.CapacityEstimateUnit)
            .HasMaxLength(16);

        builder.Property(x => x.SeasonalAvailability)
            .HasMaxLength(120);

        builder.Property(x => x.IrrigationMethod)
            .HasMaxLength(64);

        builder.Property(x => x.ServedCropZoneIdsJson);

        builder.Property(x => x.IsDeleted)
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .IsRequired();

        builder.HasIndex(x => x.FarmId);
        builder.HasIndex(x => x.Type);

        builder.HasOne(x => x.Farm)
            .WithMany()
            .HasForeignKey(x => x.FarmId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

