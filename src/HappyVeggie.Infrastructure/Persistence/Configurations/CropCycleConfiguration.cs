using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyVeggie.Infrastructure.Persistence.Configurations;

public sealed class CropCycleConfiguration : IEntityTypeConfiguration<CropCycle>
{
    public void Configure(EntityTypeBuilder<CropCycle> builder)
    {
        builder.ToTable("CropCycles");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CropZoneId).IsRequired();
        builder.Property(x => x.Season).HasMaxLength(50).IsRequired();
        builder.Property(x => x.PredictedYield).HasPrecision(18, 4);
        builder.Property(x => x.PredictedYieldUnit).HasMaxLength(20);
        builder.Property(x => x.ActualYield).HasPrecision(18, 4);
        builder.Property(x => x.ActualYieldUnit).HasMaxLength(20);
        builder.Property(x => x.Notes).HasMaxLength(1000);
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => x.CropZoneId);
        builder.HasIndex(x => new { x.CropZoneId, x.Season }).IsUnique();

        builder.HasOne(x => x.CropZone)
            .WithMany()
            .HasForeignKey(x => x.CropZoneId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
