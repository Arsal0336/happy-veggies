using MediatR;

namespace HappyVeggie.Application.Admin.Auth;

public sealed record RefreshAdminSessionCommand(Guid AdminId) : IRequest<RefreshAdminSessionResponse>;

public sealed record RefreshAdminSessionResponse(string SessionToken);
