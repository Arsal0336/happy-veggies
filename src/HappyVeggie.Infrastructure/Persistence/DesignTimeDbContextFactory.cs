using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace HappyVeggie.Infrastructure.Persistence;

public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<HappyVeggieDbContext>
{
    public HappyVeggieDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<HappyVeggieDbContext>();
        var connectionString =
            Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? LoadFromLocalSettings()
            ?? "Server=195.250.26.22;Database=vtoxico3_happyveggie;User Id=vtoxico3_veggieadmin;TrustServerCertificate=True;Encrypt=True";

        optionsBuilder.UseSqlServer(connectionString);

        return new HappyVeggieDbContext(optionsBuilder.Options);
    }

    private static string? LoadFromLocalSettings()
    {
        var dir = new DirectoryInfo(Directory.GetCurrentDirectory());
        while (dir is not null)
        {
            var localPath = Path.Combine(dir.FullName, "src", "HappyVeggie.Api", "appsettings.Local.json");
            var apiPath = Path.Combine(dir.FullName, "appsettings.Local.json");
            foreach (var candidate in new[] { localPath, apiPath })
            {
                if (!File.Exists(candidate))
                {
                    continue;
                }

                var config = new ConfigurationBuilder()
                    .AddJsonFile(candidate, optional: false)
                    .Build();
                var value = config.GetConnectionString("DefaultConnection");
                if (!string.IsNullOrWhiteSpace(value))
                {
                    return value;
                }
            }

            dir = dir.Parent;
        }

        return null;
    }
}
