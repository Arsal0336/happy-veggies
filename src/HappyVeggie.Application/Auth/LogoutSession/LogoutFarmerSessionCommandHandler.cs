using HappyVeggie.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Auth.LogoutSession;

public sealed record LogoutFarmerSessionCommand(Guid FarmerId) : IRequest<Unit>;

public sealed class LogoutFarmerSessionCommandHandler : IRequestHandler<LogoutFarmerSessionCommand, Unit>
{
    private readonly IApplicationDbContext _db;

    public LogoutFarmerSessionCommandHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(LogoutFarmerSessionCommand request, CancellationToken cancellationToken)
    {
        var farmer = await _db.Farmers
            .FirstOrDefaultAsync(f => f.Id == request.FarmerId, cancellationToken)
            ?? throw new UnauthorizedAccessException("Farmer session is no longer valid.");

        farmer.SessionVersion += 1;
        farmer.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
