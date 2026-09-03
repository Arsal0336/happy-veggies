using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyVeggie.Infrastructure.Persistence.Configurations;

public sealed class FarmConfiguration : IEntityTypeConfiguration<Farm>
{
    public void Configure(EntityTypeBuilder<Farm> builder)
    {
        builder.ToTable("Farms");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .HasMaxLength(120);

        builder.Property(x => x.Lat)
            .HasPrecision(9, 6)
            .IsRequired();

        builder.Property(x => x.Lng)
            .HasPrecision(9, 6)
            .IsRequired();

        builder.Property(x => x.RegionCode)
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(x => x.RegionLabel)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(x => x.AreaAcres)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(x => x.AreaInputValue)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(x => x.AreaInputUnit)
            .HasMaxLength(24)
            .IsRequired();

        builder.Property(x => x.PreferredCropId)
            .HasMaxLength(64);

        builder.Property(x => x.PreferredCropFreeText)
            .HasMaxLength(120);

        builder.Property(x => x.IsNewFarmSetup)
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(x => x.SoilType)
            .HasMaxLength(32);

        builder.Property(x => x.WaterSource)
            .HasMaxLength(32);

        builder.Property(x => x.BudgetAmount)
            .HasPrecision(18, 2);

        builder.Property(x => x.BudgetCurrency)
            .HasMaxLength(8);

        builder.Property(x => x.LetAiChooseCrop)
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(x => x.IsDeleted)
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .IsRequired();

        builder.HasOne(x => x.Farmer)
            .WithMany(x => x.Farms)
            .HasForeignKey(x => x.FarmerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.FarmerId);
    }
}
