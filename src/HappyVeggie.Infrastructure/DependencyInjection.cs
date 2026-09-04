using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Infrastructure.Persistence;
using HappyVeggie.Infrastructure.Providers;
using HappyVeggie.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HappyVeggie.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");
        }

        services.AddDbContext<HappyVeggieDbContext>(options =>
            options.UseSqlServer(connectionString));
        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<HappyVeggieDbContext>());

        // OTP: mock or live based on config
        var useMockOtp = configuration.GetSection("Otp:UseMock").Value != "false";
        if (useMockOtp)
            services.AddScoped<IOtpProvider, MockOtpProvider>();
        else
            services.AddScoped<IOtpProvider, LiveOtpProvider>();
        services.AddScoped<IOtpService, OtpServiceAdapter>();
        services.AddScoped<ITokenService, JwtTokenService>();
        services.AddScoped<IAdminTokenService, AdminJwtTokenService>();
        services.AddScoped<IAdminAuditService, AdminAuditService>();
        services.AddScoped<IFeatureFlagService, FeatureFlagService>();

        // Weather / soil adapters:
        // Default = stubs (safe for CI/dev). Live* implementations throw NotImplementedException (vendor TBD)
        // and are selected only when Weather:UseLive=true / Soil:UseLive=true.
        // Runtime enrichment intent is also reflected by feature flags weather.enrichment / soil.enrichment.
        var useLiveWeather = string.Equals(
            configuration["Weather:UseLive"], "true", StringComparison.OrdinalIgnoreCase);
        if (useLiveWeather)
            services.AddScoped<IWeatherProvider, LiveWeatherProvider>();
        else
            services.AddScoped<IWeatherProvider, StubWeatherProvider>();

        var useLiveSoil = string.Equals(
            configuration["Soil:UseLive"], "true", StringComparison.OrdinalIgnoreCase);
        if (useLiveSoil)
            services.AddScoped<ISoilProvider, LiveSoilProvider>();
        else
            services.AddScoped<ISoilProvider, StubSoilProvider>();

        // LLM options + provider:
        // Default = StubLlmProvider. LiveLlmProvider (vendor TBD / GAP-003) only when Llm:UseLive=true.
        // Runtime intent also reflected by feature flag llm.live (checked inside LiveLlmProvider).
        services.Configure<HappyVeggie.Application.AI.Options.LlmProviderOptions>(
            configuration.GetSection(HappyVeggie.Application.AI.Options.LlmProviderOptions.SectionName));
        services.Configure<HappyVeggie.Application.Common.Options.ProviderOptions>(
            configuration.GetSection(HappyVeggie.Application.Common.Options.ProviderOptions.SectionName));

        var useLiveLlm = string.Equals(
            configuration["Llm:UseLive"], "true", StringComparison.OrdinalIgnoreCase);
        if (useLiveLlm)
            services.AddScoped<ILlmProvider, LiveLlmProvider>();
        else
            services.AddScoped<ILlmProvider, StubLlmProvider>();

        return services;
    }
}
