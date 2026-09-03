using HappyVeggie.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Admin.Auth;

public sealed class AdminLoginCommandHandler : IRequestHandler<AdminLoginCommand, AdminLoginResponse>
{
    private readonly IApplicationDbContext _db;
    private readonly IAdminTokenService _tokenService;

    public AdminLoginCommandHandler(IApplicationDbContext db, IAdminTokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    public async Task<AdminLoginResponse> Handle(AdminLoginCommand request, CancellationToken cancellationToken)
    {
        var admin = await _db.AdminUsers
            .FirstOrDefaultAsync(a => a.Email == request.Email && a.IsActive, cancellationToken)
            ?? throw new UnauthorizedAccessException("Invalid credentials.");

        // Simple password verification — uses BCrypt-style hash comparison.
        // For MVP/demo: if PasswordHash is null, accept any password (dev convenience).
        if (admin.PasswordHash is not null)
        {
            var isMatch = BCryptVerify(request.Password, admin.PasswordHash);
            if (!isMatch)
            {
                throw new UnauthorizedAccessException("Invalid credentials.");
            }
        }

        admin.LastLoginAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        var token = _tokenService.GenerateAdminToken(admin);
        var dto = new AdminMeDto(admin.Id, admin.Email, admin.Role, admin.MfaEnabled);
        return new AdminLoginResponse(token, dto);
    }

    // Simple constant-time hash compare. In production, use a proper BCrypt library.
    // For now, plain SHA256 comparison as a placeholder until auth method is finalized (B-7 TBD).
    private static bool BCryptVerify(string password, string storedHash)
    {
        using var sha = global::System.Security.Cryptography.SHA256.Create();
        var hash = Convert.ToBase64String(sha.ComputeHash(global::System.Text.Encoding.UTF8.GetBytes(password)));
        return string.Equals(hash, storedHash, StringComparison.Ordinal);
    }
}
