using MediatR;

namespace HappyVeggie.Application.System.Health;

public sealed record HealthQuery : IRequest<HealthResponse>;

public sealed record HealthResponse(
    string Status,
    DateTimeOffset UtcNow,
    bool DbReachable,
    int FeatureFlagsCount);
