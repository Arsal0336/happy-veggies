namespace HappyVeggie.Infrastructure.Persistence;

public sealed record DatabaseRuntimeInfo(
    string Provider,
    string ConnectionString,
    bool IsSqlite);
