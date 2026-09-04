using HappyVeggie.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Admin.Auth;

public sealed class RefreshAdminSessionCommandHandler
    : IRequestHandler<RefreshAdminSessionCommand, RefreshAdminSessionResponse>
{
    private readonly IApplicationDbContext _db;
    private readonly IAdminTokenService _tokenService;

    public RefreshAdminSessionCommandHandler(IApplicationDbContext db, IAdminTokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    public async Task<RefreshAdminSessionResponse> Handle(
        RefreshAdminSessionCommand request,
        CancellationToken cancellationToken)
    {
        var admin = await _db.AdminUsers
            .FirstOrDefaultAsync(a => a.Id == request.AdminId && a.IsActive, cancellationToken)
            ?? throw new UnauthorizedAccessException("Admin session is no longer valid.");

        var token = _tokenService.GenerateAdminToken(admin);
        return new RefreshAdminSessionResponse(token);
    }
}
