using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyVeggie.Infrastructure.Persistence.Configurations;

public sealed class SoilProfileConfiguration : IEntityTypeConfiguration<SoilProfile>
{
    public void Configure(EntityTypeBuilder<SoilProfile> builder)
    {
        builder.ToTable("SoilProfiles");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.FarmId)
            .IsRequired();

        builder.Property(x => x.ProductionAreaId);

        builder.Property(x => x.SoilType)
            .HasMaxLength(64);

        builder.Property(x => x.Texture)
            .HasMaxLength(64);

        builder.Property(x => x.PhValue)
            .HasPrecision(10, 3);

        builder.Property(x => x.OrganicMatterValue)
            .HasPrecision(10, 3);

        builder.Property(x => x.NitrogenValue)
            .HasPrecision(18, 4);

        builder.Property(x => x.PhosphorusValue)
            .HasPrecision(18, 4);

        builder.Property(x => x.PotassiumValue)
            .HasPrecision(18, 4);

        builder.Property(x => x.FarmerNotes)
            .HasMaxLength(400);

        builder.Property(x => x.IsDeleted)
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .IsRequired();

        builder.HasIndex(x => x.FarmId);
        builder.HasIndex(x => x.ProductionAreaId);

        // Ensure only one soil profile per attachment (farm-level if ProductionAreaId is null).
        builder.HasIndex(x => new { x.FarmId, x.ProductionAreaId })
            .IsUnique();

        builder.HasOne(x => x.Farm)
            .WithMany()
            .HasForeignKey(x => x.FarmId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ProductionArea)
            .WithMany()
            .HasForeignKey(x => x.ProductionAreaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

