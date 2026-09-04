using HappyVeggie.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HappyVeggie.Infrastructure.Persistence.Configurations;

public sealed class FeatureFlagConfiguration : IEntityTypeConfiguration<FeatureFlag>
{
    // Stable seed IDs for HasData
    private static readonly Guid OtpUseMockId = Guid.Parse("a1000001-0000-4000-8000-000000000001");
    private static readonly Guid WeatherEnrichmentId = Guid.Parse("a1000001-0000-4000-8000-000000000002");
    private static readonly Guid SoilEnrichmentId = Guid.Parse("a1000001-0000-4000-8000-000000000003");
    private static readonly Guid LlmLiveId = Guid.Parse("a1000001-0000-4000-8000-000000000004");

    private static readonly DateTimeOffset SeedUpdatedAt = new(2026, 9, 4, 0, 0, 0, TimeSpan.Zero);

    public void Configure(EntityTypeBuilder<FeatureFlag> builder)
    {
        builder.ToTable("FeatureFlags");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Key)
            .HasMaxLength(100)
            .IsRequired();

        builder.HasIndex(x => x.Key).IsUnique();

        builder.Property(x => x.Enabled).IsRequired();

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        builder.Property(x => x.UpdatedAt).IsRequired();

        builder.HasData(
            new FeatureFlag
            {
                Id = OtpUseMockId,
                Key = "otp.use_mock",
                Enabled = true,
                Description = "Use mock OTP provider instead of live SMS",
                UpdatedAt = SeedUpdatedAt
            },
            new FeatureFlag
            {
                Id = WeatherEnrichmentId,
                Key = "weather.enrichment",
                Enabled = false,
                Description = "Enable live weather enrichment for digital twin",
                UpdatedAt = SeedUpdatedAt
            },
            new FeatureFlag
            {
                Id = SoilEnrichmentId,
                Key = "soil.enrichment",
                Enabled = false,
                Description = "Enable live soil enrichment for digital twin",
                UpdatedAt = SeedUpdatedAt
            },
            new FeatureFlag
            {
                Id = LlmLiveId,
                Key = "llm.live",
                Enabled = false,
                Description = "Use live LLM provider instead of stub",
                UpdatedAt = SeedUpdatedAt
            });
    }
}
