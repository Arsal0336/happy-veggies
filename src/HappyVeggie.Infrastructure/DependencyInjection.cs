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

        // Provider adapters (stubs — replace with real implementations)
        services.AddScoped<IWeatherProvider, StubWeatherProvider>();
        services.AddScoped<ISoilProvider, StubSoilProvider>();

        // LLM provider
        services.AddScoped<ILlmProvider, StubLlmProvider>();

        // LLM options
        services.Configure<HappyVeggie.Application.AI.Options.LlmProviderOptions>(
            configuration.GetSection(HappyVeggie.Application.AI.Options.LlmProviderOptions.SectionName));

        return services;
    }
}
