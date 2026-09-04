using MediatR;

namespace HappyVeggie.Application.Auth.RefreshSession;

public sealed record RefreshFarmerSessionCommand(Guid FarmerId) : IRequest<RefreshSessionResponse>;

public sealed record RefreshSessionResponse(string SessionToken);
