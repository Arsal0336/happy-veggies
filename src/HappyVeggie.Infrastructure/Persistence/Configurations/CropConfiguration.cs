using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyVeggie.Infrastructure.Persistence.Configurations;

public sealed class CropConfiguration : IEntityTypeConfiguration<Crop>
{
    public void Configure(EntityTypeBuilder<Crop> builder)
    {
        builder.ToTable("Crops");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(x => x.NameEn)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(x => x.NameUr)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(x => x.IconUrl)
            .HasMaxLength(256);

        builder.Property(x => x.Enabled)
            .HasDefaultValue(true)
            .IsRequired();

        builder.HasIndex(x => x.Enabled);

        builder.HasData(
            new Crop { Id = "tomato", NameEn = "Tomato", NameUr = "ٹماٹر", Enabled = true },
            new Crop { Id = "potato", NameEn = "Potato", NameUr = "آلو", Enabled = true },
            new Crop { Id = "onion", NameEn = "Onion", NameUr = "پیااز", Enabled = true },
            new Crop { Id = "cucumber", NameEn = "Cucumber", NameUr = "کھیر ی", Enabled = true },
            new Crop { Id = "capsicum", NameEn = "Capsicum", NameUr = "شملہ مرچ", Enabled = true },
            new Crop { Id = "chili", NameEn = "Chili", NameUr = "مرچ", Enabled = true },
            new Crop { Id = "eggplant", NameEn = "Eggplant", NameUr = "بینگن", Enabled = true },
            new Crop { Id = "okra", NameEn = "Okra", NameUr = "بھِنڈی", Enabled = true },
            new Crop { Id = "spinach", NameEn = "Spinach", NameUr = "پالک", Enabled = true },
            new Crop { Id = "cabbage", NameEn = "Cabbage", NameUr = "بند گوبھی", Enabled = true },
            new Crop { Id = "carrot", NameEn = "Carrot", NameUr = "گاجر", Enabled = true },
            new Crop { Id = "lettuce", NameEn = "Lettuce", NameUr = "لیٹش", Enabled = true }
        );
    }
}

