using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyVeggie.Infrastructure.Persistence.Configurations;

public sealed class ProductionAreaConfiguration : IEntityTypeConfiguration<ProductionArea>
{
    public void Configure(EntityTypeBuilder<ProductionArea> builder)
    {
        builder.ToTable("ProductionAreas");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TypeCode)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(x => x.Name)
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

        builder.Property(x => x.TemperatureC)
            .HasPrecision(10, 3);

        builder.Property(x => x.HumidityPercent)
            .HasPrecision(10, 3);

        builder.Property(x => x.IsDeleted)
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .IsRequired();

        builder.HasIndex(x => x.FarmId);
        builder.HasIndex(x => x.TypeCode);
        builder.HasIndex(x => new { x.FarmId, x.TypeCode });

        builder.HasOne(x => x.Farm)
            .WithMany(x => x.ProductionAreas)
            .HasForeignKey(x => x.FarmId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Type)
            .WithMany(x => x.ProductionAreas)
            .HasForeignKey(x => x.TypeCode)
            .HasPrincipalKey(x => x.Code)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
