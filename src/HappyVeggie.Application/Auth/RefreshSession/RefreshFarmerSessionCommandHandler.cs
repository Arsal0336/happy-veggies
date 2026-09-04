using HappyVeggie.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Auth.RefreshSession;

public sealed class RefreshFarmerSessionCommandHandler
    : IRequestHandler<RefreshFarmerSessionCommand, RefreshSessionResponse>
{
    private readonly IApplicationDbContext _db;
    private readonly ITokenService _tokenService;

    public RefreshFarmerSessionCommandHandler(IApplicationDbContext db, ITokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    public async Task<RefreshSessionResponse> Handle(
        RefreshFarmerSessionCommand request,
        CancellationToken cancellationToken)
    {
        var farmer = await _db.Farmers
            .FirstOrDefaultAsync(f => f.Id == request.FarmerId, cancellationToken)
            ?? throw new UnauthorizedAccessException("Farmer session is no longer valid.");

        var token = _tokenService.GenerateFarmerToken(farmer);
        return new RefreshSessionResponse(token);
    }
}
