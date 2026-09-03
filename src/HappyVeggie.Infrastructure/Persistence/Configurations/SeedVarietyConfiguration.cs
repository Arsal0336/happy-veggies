using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyVeggie.Infrastructure.Persistence.Configurations;

public sealed class SeedVarietyConfiguration : IEntityTypeConfiguration<SeedVariety>
{
    public void Configure(EntityTypeBuilder<SeedVariety> builder)
    {
        builder.ToTable("SeedVarieties");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(x => x.CropId)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(x => x.NameEn)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(x => x.NameUr)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(x => x.VarietyType)
            .IsRequired();

        builder.Property(x => x.Enabled)
            .HasDefaultValue(true)
            .IsRequired();

        builder.Property(x => x.MaturityDays);

        builder.Property(x => x.RiskBand);

        builder.Property(x => x.SoilNotes)
            .HasMaxLength(400);

        builder.Property(x => x.WaterNotes)
            .HasMaxLength(400);

        builder.Property(x => x.DiseaseResistanceNotes)
            .HasMaxLength(400);

        builder.HasIndex(x => x.Enabled);
        builder.HasIndex(x => x.CropId);

        builder.HasOne(x => x.Crop)
            .WithMany()
            .HasForeignKey(x => x.CropId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasData(
            new SeedVariety
            {
                Id = "tomato_hybrid_1",
                CropId = "tomato",
                NameEn = "Tomato Hybrid A",
                NameUr = "ہائبرڈ ٹماٹر اے",
                VarietyType = SeedVarietyType.Hybrid,
                Enabled = true,
                MaturityDays = 75,
                RiskBand = RiskBand.Medium,
                SoilNotes = "General vegetable-friendly soil",
                WaterNotes = "Moderate irrigation; avoid waterlogging",
                DiseaseResistanceNotes = "Basic fungal resistance (demo)"
            },
            new SeedVariety
            {
                Id = "tomato_openpoll_1",
                CropId = "tomato",
                NameEn = "Tomato Open Pollinated B",
                NameUr = "اوپن پولینیٹڈ ٹماٹر بی",
                VarietyType = SeedVarietyType.OpenPollinated,
                Enabled = true,
                MaturityDays = 90,
                RiskBand = RiskBand.Medium,
                SoilNotes = "Works across common farm soils",
                WaterNotes = "Steady watering schedule",
                DiseaseResistanceNotes = "Moderate disease tolerance (demo)"
            },
            new SeedVariety
            {
                Id = "potato_local_1",
                CropId = "potato",
                NameEn = "Local Potato Variety X",
                NameUr = "مقامی آلو قسم ایکس",
                VarietyType = SeedVarietyType.Local,
                Enabled = true,
                MaturityDays = 100,
                RiskBand = RiskBand.Medium
            },
            new SeedVariety
            {
                Id = "onion_local_1",
                CropId = "onion",
                NameEn = "Local Onion Variety A",
                NameUr = "مقامی پیاز قسم اے",
                VarietyType = SeedVarietyType.Local,
                Enabled = true,
                MaturityDays = 95,
                RiskBand = RiskBand.Medium
            },
            new SeedVariety
            {
                Id = "cucumber_hybrid_1",
                CropId = "cucumber",
                NameEn = "Cucumber Hybrid C",
                NameUr = "ہائبرڈ کھیر ی سی",
                VarietyType = SeedVarietyType.Hybrid,
                Enabled = true,
                MaturityDays = 50,
                RiskBand = RiskBand.Medium
            },
            new SeedVariety
            {
                Id = "capsicum_hybrid_1",
                CropId = "capsicum",
                NameEn = "Capsicum Hybrid D",
                NameUr = "ہائبرڈ شملہ مرچ ڈی",
                VarietyType = SeedVarietyType.Hybrid,
                Enabled = true,
                MaturityDays = 80,
                RiskBand = RiskBand.Medium
            },
            new SeedVariety
            {
                Id = "chili_hybrid_1",
                CropId = "chili",
                NameEn = "Chili Hybrid E",
                NameUr = "ہائبرڈ مرچ ای",
                VarietyType = SeedVarietyType.Hybrid,
                Enabled = true,
                MaturityDays = 70,
                RiskBand = RiskBand.Medium
            },
            new SeedVariety
            {
                Id = "eggplant_openpoll_1",
                CropId = "eggplant",
                NameEn = "Eggplant Open Pollinated F",
                NameUr = "اوپن پولینیٹڈ بینگن ایف",
                VarietyType = SeedVarietyType.OpenPollinated,
                Enabled = true,
                MaturityDays = 95,
                RiskBand = RiskBand.Medium
            },
            new SeedVariety
            {
                Id = "okra_local_1",
                CropId = "okra",
                NameEn = "Okra Local Variety G",
                NameUr = "مقامی بھِنڈی قسم جی",
                VarietyType = SeedVarietyType.Local,
                Enabled = true,
                MaturityDays = 55,
                RiskBand = RiskBand.Medium
            },
            new SeedVariety
            {
                Id = "spinach_openpoll_1",
                CropId = "spinach",
                NameEn = "Spinach Open Pollinated H",
                NameUr = "اوپن پولینیٹڈ پالک ایچ",
                VarietyType = SeedVarietyType.OpenPollinated,
                Enabled = true,
                MaturityDays = 40,
                RiskBand = RiskBand.Medium
            },
            new SeedVariety
            {
                Id = "cabbage_local_1",
                CropId = "cabbage",
                NameEn = "Cabbage Local Variety I",
                NameUr = "مقامی بند گوبھی آئی",
                VarietyType = SeedVarietyType.Local,
                Enabled = true,
                MaturityDays = 75,
                RiskBand = RiskBand.Medium
            },
            new SeedVariety
            {
                Id = "carrot_local_1",
                CropId = "carrot",
                NameEn = "Carrot Local Variety J",
                NameUr = "مقامی گاجر جے",
                VarietyType = SeedVarietyType.Local,
                Enabled = true,
                MaturityDays = 70,
                RiskBand = RiskBand.Medium
            },
            new SeedVariety
            {
                Id = "lettuce_local_1",
                CropId = "lettuce",
                NameEn = "Lettuce Local Variety K",
                NameUr = "مقامی لیٹش کے",
                VarietyType = SeedVarietyType.Local,
                Enabled = true,
                MaturityDays = 45,
                RiskBand = RiskBand.Medium
            }
        );
    }
}

