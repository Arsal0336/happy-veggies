using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyVeggie.Infrastructure.Persistence.Configurations;

public sealed class ProductionAreaTypeConfiguration : IEntityTypeConfiguration<ProductionAreaType>
{
    public void Configure(EntityTypeBuilder<ProductionAreaType> builder)
    {
        builder.ToTable("ProductionAreaTypes");

        builder.HasKey(x => x.Code);

        builder.Property(x => x.Code)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(x => x.NameEn)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(x => x.NameUr)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(x => x.Category)
            .IsRequired();

        builder.Property(x => x.Enabled)
            .HasDefaultValue(true)
            .IsRequired();

        builder.HasIndex(x => x.Enabled);
        builder.HasIndex(x => x.Category);

        builder.HasData(
            new ProductionAreaType
            {
                Code = "open_field",
                NameEn = "Open Field",
                NameUr = "کھلا میدان",
                Category = ProductionAreaTypeCategory.Open,
                Enabled = true
            },
            new ProductionAreaType
            {
                Code = "shed",
                NameEn = "Shed",
                NameUr = "شیڈ",
                Category = ProductionAreaTypeCategory.Protected,
                Enabled = true
            },
            new ProductionAreaType
            {
                Code = "greenhouse",
                NameEn = "Greenhouse",
                NameUr = "گرین ہاؤس",
                Category = ProductionAreaTypeCategory.Protected,
                Enabled = true
            },
            new ProductionAreaType
            {
                Code = "tunnel_polyhouse",
                NameEn = "Tunnel / Polyhouse",
                NameUr = "ٹنل / پولی ہاؤس",
                Category = ProductionAreaTypeCategory.Protected,
                Enabled = true
            },
            new ProductionAreaType
            {
                Code = "experimental",
                NameEn = "Experimental",
                NameUr = "تجربی",
                Category = ProductionAreaTypeCategory.Experimental,
                Enabled = true
            },
            new ProductionAreaType
            {
                Code = "other_protected",
                NameEn = "Other Protected",
                NameUr = "دیگر محفوظ ماحول",
                Category = ProductionAreaTypeCategory.Protected,
                Enabled = true
            });
    }
}
