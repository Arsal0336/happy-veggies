using Microsoft.EntityFrameworkCore;
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
    }
}
