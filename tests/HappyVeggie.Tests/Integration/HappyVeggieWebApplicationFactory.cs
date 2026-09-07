using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace HappyVeggie.Tests.Integration;

public sealed class HappyVeggieWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _contentRoot = Path.Combine(Path.GetTempPath(), $"hv-tests-{Guid.NewGuid():N}");

    public HappyVeggieWebApplicationFactory()
    {
        Directory.CreateDirectory(_contentRoot);
        Directory.CreateDirectory(Path.Combine(_contentRoot, "App_Data"));
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            try
            {
                if (Directory.Exists(_contentRoot))
                {
                    Directory.Delete(_contentRoot, recursive: true);
                }
            }
            catch
            {
                // Best-effort cleanup for temp test DB/files.
            }
        }

        base.Dispose(disposing);
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseContentRoot(_contentRoot);
        builder.UseEnvironment("Development");

        builder.UseSetting("Database:Provider", "Sqlite");
        builder.UseSetting("ConnectionStrings:DefaultConnection", string.Empty);
        builder.UseSetting("Otp:UseMock", "true");
        builder.UseSetting("Llm:UseLive", "false");
        builder.UseSetting("Weather:UseLive", "false");
        builder.UseSetting("Soil:UseLive", "false");
        builder.UseSetting("Swagger:Enabled", "false");
        builder.UseSetting("Jwt:Issuer", "HappyVeggie");
        builder.UseSetting("Jwt:Audience", "HappyVeggie.FarmerApi");
        builder.UseSetting("Jwt:SigningKey", "IntegrationTestsSigningKeyMustBeLongEnough123!");
        builder.UseSetting("RateLimiting:Otp:PermitLimit", "1000");
        builder.UseSetting("RateLimiting:Plan:PermitLimit", "1000");
        builder.UseSetting("RateLimiting:Assistant:PermitLimit", "1000");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Database:Provider"] = "Sqlite",
                ["ConnectionStrings:DefaultConnection"] = string.Empty,
                ["Otp:UseMock"] = "true",
                ["Llm:UseLive"] = "false",
                ["Weather:UseLive"] = "false",
                ["Soil:UseLive"] = "false",
                ["Swagger:Enabled"] = "false",
                ["Jwt:Issuer"] = "HappyVeggie",
                ["Jwt:Audience"] = "HappyVeggie.FarmerApi",
                ["Jwt:SigningKey"] = "IntegrationTestsSigningKeyMustBeLongEnough123!",
                ["RateLimiting:Otp:PermitLimit"] = "1000",
                ["RateLimiting:Plan:PermitLimit"] = "1000",
                ["RateLimiting:Assistant:PermitLimit"] = "1000",
            });
        });
    }
}

[CollectionDefinition("Integration")]
public sealed class IntegrationCollection : ICollectionFixture<HappyVeggieWebApplicationFactory>;
