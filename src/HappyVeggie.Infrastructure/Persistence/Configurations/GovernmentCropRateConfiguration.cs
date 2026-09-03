using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyVeggie.Infrastructure.Persistence.Configurations;

public sealed class GovernmentCropRateConfiguration : IEntityTypeConfiguration<GovernmentCropRate>
{
    public void Configure(EntityTypeBuilder<GovernmentCropRate> builder)
    {
        builder.ToTable("GovernmentCropRates");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CropId).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Unit).HasMaxLength(20).IsRequired();
        builder.Property(x => x.RatePerUnit).HasPrecision(18, 4).IsRequired();
        builder.Property(x => x.Currency).HasMaxLength(10).IsRequired();
        builder.Property(x => x.Period).HasMaxLength(50).IsRequired();
        builder.Property(x => x.SourceLabel).HasMaxLength(200);
        builder.Property(x => x.IsActive).HasDefaultValue(true);
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => new { x.CropId, x.Period });
    }
}
