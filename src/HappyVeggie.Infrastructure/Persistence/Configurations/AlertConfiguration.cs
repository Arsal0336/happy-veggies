using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyVeggie.Infrastructure.Persistence.Configurations;

public sealed class AlertConfiguration : IEntityTypeConfiguration<Alert>
{
    public void Configure(EntityTypeBuilder<Alert> builder)
    {
        builder.ToTable("Alerts");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.FarmId).IsRequired();
        builder.Property(x => x.Type).HasMaxLength(80).IsRequired();
        builder.Property(x => x.Severity).HasMaxLength(40).IsRequired();
        builder.Property(x => x.Title).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Body).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.SourceSignal).HasMaxLength(120);
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => x.FarmId);
        builder.HasIndex(x => new { x.FarmId, x.IsRead });
        builder.HasIndex(x => new { x.FarmId, x.SourceSignal });

        builder.HasOne(x => x.Farm)
            .WithMany()
            .HasForeignKey(x => x.FarmId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
