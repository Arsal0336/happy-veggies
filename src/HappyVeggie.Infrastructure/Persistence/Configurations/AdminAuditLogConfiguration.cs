using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyVeggie.Infrastructure.Persistence.Configurations;

public sealed class AdminAuditLogConfiguration : IEntityTypeConfiguration<AdminAuditLog>
{
    public void Configure(EntityTypeBuilder<AdminAuditLog> builder)
    {
        builder.ToTable("AdminAuditLogs");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ActorAdminId).IsRequired();

        builder.Property(x => x.Action)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.TargetType)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.TargetId)
            .HasMaxLength(200);

        builder.Property(x => x.MetadataJson)
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.Timestamp).IsRequired();

        builder.HasIndex(x => x.Timestamp);
        builder.HasIndex(x => x.ActorAdminId);
    }
}
