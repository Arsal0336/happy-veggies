using MediatR;

namespace HappyVeggie.Application.System.Ping;

public sealed record PingQuery : IRequest<PingResponse>;

public sealed record PingResponse(string Status, DateTimeOffset UtcNow);
