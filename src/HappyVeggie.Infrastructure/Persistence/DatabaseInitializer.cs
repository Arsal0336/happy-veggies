using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace HappyVeggie.Infrastructure.Persistence;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<HappyVeggieDbContext>();
        var runtime = scope.ServiceProvider.GetRequiredService<DatabaseRuntimeInfo>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("HappyVeggie.Database");

        if (runtime.IsSqlite)
        {
            try
            {
                await db.Database.EnsureCreatedAsync(cancellationToken);
            }
            catch
            {
                await db.Database.EnsureDeletedAsync(cancellationToken);
                await db.Database.EnsureCreatedAsync(cancellationToken);
            }

            logger.LogInformation("Using Sqlite at {Connection}", runtime.ConnectionString);
        }
        else
        {
            await db.Database.MigrateAsync(cancellationToken);
            logger.LogInformation("Using SqlServer");
        }

        await DemoDataSeeder.SeedAsync(db, cancellationToken);

        // Keep llm.live aligned with Llm:UseLive for local/demo (EnsureCreated won't re-apply HasData).
        var useLiveLlm = string.Equals(
            configuration["Llm:UseLive"],
            "true",
            StringComparison.OrdinalIgnoreCase);
        if (useLiveLlm)
        {
            var llmFlag = await db.FeatureFlags.FirstOrDefaultAsync(f => f.Key == "llm.live", cancellationToken);
            if (llmFlag is not null && !llmFlag.Enabled)
            {
                llmFlag.Enabled = true;
                llmFlag.UpdatedAt = DateTimeOffset.UtcNow;
                await db.SaveChangesAsync(cancellationToken);
                logger.LogInformation("Enabled feature flag llm.live because Llm:UseLive=true");
            }
        }
    }
}
