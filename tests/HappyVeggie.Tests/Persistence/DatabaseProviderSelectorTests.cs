using System.Text;
using HappyVeggie.Infrastructure.Persistence;
using Microsoft.Extensions.Configuration;

namespace HappyVeggie.Tests.Persistence;

public class DatabaseProviderSelectorTests
{
    [Fact]
    public void Auto_WithEmptyConnection_UsesSqlite()
    {
        var json = """
        {
          "Database": { "Provider": "Auto" },
          "ConnectionStrings": { "DefaultConnection": "" }
        }
        """;
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(json));
        var config = new ConfigurationBuilder().AddJsonStream(stream).Build();

        var root = Path.Combine(Path.GetTempPath(), "hv-db-" + Guid.NewGuid().ToString("N"));
        var runtime = DatabaseProviderSelector.Resolve(config, root);

        Assert.True(runtime.IsSqlite);
        Assert.Equal(DatabaseProviderSelector.Sqlite, runtime.Provider);
        Assert.Contains("happyveggie.db", runtime.ConnectionString);
        Assert.True(Directory.Exists(Path.Combine(root, "App_Data")));
    }

    [Fact]
    public void PlaceholderSqlServerString_IsNotUsable()
    {
        Assert.False(DatabaseProviderSelector.IsUsableSqlServerConnectionString(
            "Server=x;Password=SET_VIA_USER_SECRETS_OR_APPSETTINGS_LOCAL"));
        Assert.False(DatabaseProviderSelector.IsUsableSqlServerConnectionString(" "));
    }
}
