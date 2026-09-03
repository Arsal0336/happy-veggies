using MediatR;

namespace HappyVeggie.Application.Admin.Auth;

public sealed record GetAdminMeQuery(Guid AdminId) : IRequest<AdminMeDto>;
