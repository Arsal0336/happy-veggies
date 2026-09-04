using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyVeggie.Infrastructure.Persistence.Configurations;

public sealed class TwinSnapshotConfiguration : IEntityTypeConfiguration<TwinSnapshot>
{
    public void Configure(EntityTypeBuilder<TwinSnapshot> builder)
    {
        builder.ToTable("TwinSnapshots");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.FarmId)
            .IsRequired();

        builder.Property(x => x.TwinJson)
            .IsRequired();

        builder.Property(x => x.RefreshedAt)
            .IsRequired();

        builder.Property(x => x.WeatherProviderStatus)
            .HasMaxLength(64);

        builder.Property(x => x.SoilProviderStatus)
            .HasMaxLength(64);

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .IsRequired();

        // Keep a single latest twin snapshot row per farm (history handled later if needed).
        builder.HasIndex(x => x.FarmId)
            .IsUnique();

        builder.HasOne(x => x.Farm)
            .WithMany()
            .HasForeignKey(x => x.FarmId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

