using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace HappyVeggie.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(typeof(DependencyInjection).Assembly);
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(Common.Behaviors.ValidationBehavior<,>));
        services.AddScoped<Common.Services.FarmOwnershipGuard>();
        services.AddScoped<DigitalTwin.Services.DigitalTwinAssembler>();
        services.AddScoped<Compatibility.CompatibilityService>();
        services.AddScoped<Economics.EconomicsService>();
        services.AddScoped<Yield.YieldEstimationService>();
        services.AddScoped<Planning.CropPlanningService>();
        services.AddScoped<Nearby.NearbyFarmsService>();
        services.AddScoped<Suggestions.SeedVarietySuggestionService>();
        services.AddScoped<GreenScore.GreenFarmScoringService>();
        services.AddScoped<Alerts.AlertEvaluationService>();
        services.AddScoped<CropCycles.CropCycleService>();
        services.AddScoped<Portfolio.PortfolioService>();

        // AI services
        services.AddScoped<AI.Context.FarmContextBuilder>();
        services.AddScoped<AI.Services.LlmUsageLogger>();
        services.AddScoped<Common.Interfaces.ILlmUsageRecorder>(sp =>
            sp.GetRequiredService<AI.Services.LlmUsageLogger>());
        services.AddScoped<AI.Services.AiPlanGenerationService>();
        services.AddScoped<AI.Services.AssistantResponseValidator>();
        services.AddScoped<AI.Services.FarmAssistantService>();
        services.AddScoped<AI.Services.GreenTipService>();

        return services;
    }
}
