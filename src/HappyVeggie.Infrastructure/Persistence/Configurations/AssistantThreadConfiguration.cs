using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyVeggie.Infrastructure.Persistence.Configurations;

public sealed class AssistantThreadConfiguration : IEntityTypeConfiguration<AssistantThread>
{
    public void Configure(EntityTypeBuilder<AssistantThread> builder)
    {
        builder.ToTable("AssistantThreads");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.FarmId).IsRequired();
        builder.Property(x => x.FarmerId).IsRequired();

        builder.Property(x => x.Title).HasMaxLength(200);

        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.IsArchived).HasDefaultValue(false);

        builder.HasIndex(x => x.FarmId);
        builder.HasIndex(x => x.FarmerId);

        builder.HasOne(x => x.Farm)
            .WithMany()
            .HasForeignKey(x => x.FarmId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Farmer)
            .WithMany()
            .HasForeignKey(x => x.FarmerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Messages)
            .WithOne(x => x.Thread)
            .HasForeignKey(x => x.ThreadId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
