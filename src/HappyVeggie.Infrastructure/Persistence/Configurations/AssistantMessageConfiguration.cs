using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyVeggie.Infrastructure.Persistence.Configurations;

public sealed class AssistantMessageConfiguration : IEntityTypeConfiguration<AssistantMessage>
{
    public void Configure(EntityTypeBuilder<AssistantMessage> builder)
    {
        builder.ToTable("AssistantMessages");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ThreadId).IsRequired();

        builder.Property(x => x.Role)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Content)
            .HasColumnType("nvarchar(max)")
            .IsRequired();

        builder.Property(x => x.CitationsJson)
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => x.ThreadId);
    }
}
