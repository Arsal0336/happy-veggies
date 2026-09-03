using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyVeggie.Infrastructure.Persistence.Configurations;

public sealed class CropCompatibilityConfiguration : IEntityTypeConfiguration<CropCompatibility>
{
    public void Configure(EntityTypeBuilder<CropCompatibility> builder)
    {
        builder.ToTable("CropCompatibility");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CropAId)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(x => x.CropBId)
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(x => x.Reason)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(x => x.Enabled)
            .HasDefaultValue(true)
            .IsRequired();

        builder.HasIndex(x => x.CropAId);
        builder.HasIndex(x => x.CropBId);
        builder.HasIndex(x => new { x.CropAId, x.CropBId, x.Scope });

        // Minimal demo seed set (full admin curation later).
        // Note: we seed both directions so lookup can remain order-agnostic.
        builder.HasData(
            new CropCompatibility
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                CropAId = "tomato",
                CropBId = "onion",
                Relation = CropCompatibilityRelation.Good,
                Reason = "Commonly paired to reduce pests (demo seed).",
                Scope = CropCompatibilityScope.OnFarmNeighbour,
                Enabled = true
            },
            new CropCompatibility
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111112"),
                CropAId = "onion",
                CropBId = "tomato",
                Relation = CropCompatibilityRelation.Good,
                Reason = "Commonly paired to reduce pests (demo seed).",
                Scope = CropCompatibilityScope.OnFarmNeighbour,
                Enabled = true
            },
            new CropCompatibility
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111113"),
                CropAId = "tomato",
                CropBId = "potato",
                Relation = CropCompatibilityRelation.Avoid,
                Reason = "Both can share similar pests/diseases (demo seed).",
                Scope = CropCompatibilityScope.OnFarmNeighbour,
                Enabled = true
            },
            new CropCompatibility
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111114"),
                CropAId = "potato",
                CropBId = "tomato",
                Relation = CropCompatibilityRelation.Avoid,
                Reason = "Both can share similar pests/diseases (demo seed).",
                Scope = CropCompatibilityScope.OnFarmNeighbour,
                Enabled = true
            },
            new CropCompatibility
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111115"),
                CropAId = "cucumber",
                CropBId = "capsicum",
                Relation = CropCompatibilityRelation.Good,
                Reason = "Compatible spacing/companion growth pattern (demo seed).",
                Scope = CropCompatibilityScope.OnFarmNeighbour,
                Enabled = true
            },
            new CropCompatibility
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111116"),
                CropAId = "capsicum",
                CropBId = "cucumber",
                Relation = CropCompatibilityRelation.Good,
                Reason = "Compatible spacing/companion growth pattern (demo seed).",
                Scope = CropCompatibilityScope.OnFarmNeighbour,
                Enabled = true
            },
            new CropCompatibility
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111117"),
                CropAId = "spinach",
                CropBId = "onion",
                Relation = CropCompatibilityRelation.Neutral,
                Reason = "Neutral compatibility for on-farm adjacency (demo seed).",
                Scope = CropCompatibilityScope.OnFarmNeighbour,
                Enabled = true
            },
            new CropCompatibility
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111118"),
                CropAId = "onion",
                CropBId = "spinach",
                Relation = CropCompatibilityRelation.Neutral,
                Reason = "Neutral compatibility for on-farm adjacency (demo seed).",
                Scope = CropCompatibilityScope.OnFarmNeighbour,
                Enabled = true
            });
    }
}

