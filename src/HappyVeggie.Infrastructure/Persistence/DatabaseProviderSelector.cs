using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace HappyVeggie.Infrastructure.Persistence;

public static class DatabaseProviderSelector
{
    public const string Auto = "Auto";
    public const string SqlServer = "SqlServer";
    public const string Sqlite = "Sqlite";

    public static DatabaseRuntimeInfo Resolve(IConfiguration configuration, string contentRootPath)
    {
        var requested = configuration["Database:Provider"] ?? Auto;
        var sqlCs = configuration.GetConnectionString("DefaultConnection");
        var sqlitePath = Path.Combine(contentRootPath, "App_Data", "happyveggie.db");
        var sqliteCs = $"Data Source={sqlitePath}";

        if (requested.Equals(Sqlite, StringComparison.OrdinalIgnoreCase))
        {
            EnsureSqliteDirectory(sqlitePath);
            return new DatabaseRuntimeInfo(Sqlite, sqliteCs, IsSqlite: true);
        }

        if (requested.Equals(SqlServer, StringComparison.OrdinalIgnoreCase))
        {
            if (!IsUsableSqlServerConnectionString(sqlCs))
            {
                throw new InvalidOperationException(
                    "Database:Provider is SqlServer but ConnectionStrings:DefaultConnection is missing or a placeholder.");
            }

            return new DatabaseRuntimeInfo(SqlServer, sqlCs!, IsSqlite: false);
        }

        if (IsUsableSqlServerConnectionString(sqlCs) && CanOpenSqlServer(sqlCs!))
        {
            return new DatabaseRuntimeInfo(SqlServer, sqlCs!, IsSqlite: false);
        }

        EnsureSqliteDirectory(sqlitePath);
        return new DatabaseRuntimeInfo(Sqlite, sqliteCs, IsSqlite: true);
    }

    public static bool IsUsableSqlServerConnectionString(string? connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return false;
        }

        if (connectionString.Contains("SET_VIA_USER_SECRETS", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        return true;
    }

    public static bool CanOpenSqlServer(string connectionString)
    {
        try
        {
            var builder = new SqlConnectionStringBuilder(connectionString)
            {
                ConnectTimeout = 3
            };
            using var connection = new SqlConnection(builder.ConnectionString);
            connection.Open();
            return true;
        }
        catch
        {
            return false;
        }
    }

    private static void EnsureSqliteDirectory(string sqlitePath)
    {
        var dir = Path.GetDirectoryName(sqlitePath);
        if (!string.IsNullOrWhiteSpace(dir))
        {
            Directory.CreateDirectory(dir);
        }
    }
}
