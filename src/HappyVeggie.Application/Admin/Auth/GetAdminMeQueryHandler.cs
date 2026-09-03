using HappyVeggie.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Admin.Auth;

public sealed class GetAdminMeQueryHandler : IRequestHandler<GetAdminMeQuery, AdminMeDto>
{
    private readonly IApplicationDbContext _db;

    public GetAdminMeQueryHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<AdminMeDto> Handle(GetAdminMeQuery request, CancellationToken cancellationToken)
    {
        var admin = await _db.AdminUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == request.AdminId && a.IsActive, cancellationToken)
            ?? throw new KeyNotFoundException("Admin not found.");

        return new AdminMeDto(admin.Id, admin.Email, admin.Role, admin.MfaEnabled);
    }
}
