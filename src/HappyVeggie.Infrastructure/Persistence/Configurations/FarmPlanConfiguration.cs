using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyVeggie.Infrastructure.Persistence.Configurations;

public sealed class FarmPlanConfiguration : IEntityTypeConfiguration<FarmPlan>
{
    public void Configure(EntityTypeBuilder<FarmPlan> builder)
    {
        builder.ToTable("FarmPlans");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.FarmId).IsRequired();
        builder.Property(x => x.FarmerId).IsRequired();

        builder.Property(x => x.Language)
            .HasMaxLength(5)
            .IsRequired();

        builder.Property(x => x.ContentJson)
            .HasColumnType("nvarchar(max)")
            .IsRequired();

        builder.Property(x => x.ContextUsedJson)
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.Version).IsRequired();

        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => new { x.FarmId, x.Version }).IsUnique();
        builder.HasIndex(x => x.FarmerId);

        builder.HasOne(x => x.Farm)
            .WithMany()
            .HasForeignKey(x => x.FarmId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Farmer)
            .WithMany()
            .HasForeignKey(x => x.FarmerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
