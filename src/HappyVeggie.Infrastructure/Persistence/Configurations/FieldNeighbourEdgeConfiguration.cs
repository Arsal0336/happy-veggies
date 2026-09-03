using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyVeggie.Infrastructure.Persistence.Configurations;

public sealed class FieldNeighbourEdgeConfiguration : IEntityTypeConfiguration<FieldNeighbourEdge>
{
    public void Configure(EntityTypeBuilder<FieldNeighbourEdge> builder)
    {
        builder.ToTable("FieldNeighbourEdges");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.FarmId)
            .IsRequired();

        builder.Property(x => x.CropZoneAId)
            .IsRequired();

        builder.Property(x => x.CropZoneBId)
            .IsRequired();

        builder.Property(x => x.AdjacencyType)
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(x => x.Source)
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(x => x.Enabled)
            .HasDefaultValue(true)
            .IsRequired();

        builder.HasIndex(x => x.FarmId);
        builder.HasIndex(x => new { x.FarmId, x.CropZoneAId, x.CropZoneBId });

        builder.HasOne<Farm>()
            .WithMany()
            .HasForeignKey(x => x.FarmId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<CropZone>()
            .WithMany()
            .HasForeignKey(x => x.CropZoneAId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<CropZone>()
            .WithMany()
            .HasForeignKey(x => x.CropZoneBId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
