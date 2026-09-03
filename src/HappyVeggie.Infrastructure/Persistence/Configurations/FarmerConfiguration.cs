using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyVeggie.Infrastructure.Persistence.Configurations;

public sealed class FarmerConfiguration : IEntityTypeConfiguration<Farmer>
{
    public void Configure(EntityTypeBuilder<Farmer> builder)
    {
        builder.ToTable("Farmers");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Phone)
            .HasMaxLength(16)
            .IsRequired();

        builder.Property(x => x.Name)
            .HasMaxLength(60);

        builder.Property(x => x.Language)
            .HasMaxLength(5)
            .HasDefaultValue("en")
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .IsRequired();

        builder.HasIndex(x => x.Phone)
            .IsUnique();
    }
}
