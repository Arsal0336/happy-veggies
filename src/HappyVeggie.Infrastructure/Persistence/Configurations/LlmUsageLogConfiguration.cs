using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyVeggie.Infrastructure.Persistence.Configurations;

public sealed class LlmUsageLogConfiguration : IEntityTypeConfiguration<LlmUsageLog>
{
    public void Configure(EntityTypeBuilder<LlmUsageLog> builder)
    {
        builder.ToTable("LlmUsageLogs");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.RequestType)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Model)
            .HasMaxLength(120);

        builder.Property(x => x.EstimatedCostUsd)
            .HasPrecision(18, 8);

        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => x.CreatedAt);
        builder.HasIndex(x => x.RequestType);
    }
}
