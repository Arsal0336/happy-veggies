using MediatR;

namespace HappyVeggie.Application.System.Ping;

public sealed class PingQueryHandler : IRequestHandler<PingQuery, PingResponse>
{
    public Task<PingResponse> Handle(PingQuery request, CancellationToken cancellationToken)
    {
        return Task.FromResult(new PingResponse("ok", DateTimeOffset.UtcNow));
    }
}
