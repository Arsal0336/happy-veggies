using MediatR;

namespace HappyVeggie.Application.Admin.Auth;

public sealed record AdminLoginCommand(string Email, string Password) : IRequest<AdminLoginResponse>;

public sealed record AdminLoginResponse(string SessionToken, AdminMeDto Admin);

public sealed record AdminMeDto(Guid Id, string Email, string Role, bool MfaEnabled);
