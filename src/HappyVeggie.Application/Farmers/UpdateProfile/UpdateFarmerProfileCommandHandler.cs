using HappyVeggie.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Farmers.UpdateProfile;

public sealed class UpdateFarmerProfileCommandHandler : IRequestHandler<UpdateFarmerProfileCommand, UpdateFarmerProfileResponse>
{
    private readonly IApplicationDbContext _db;

    public UpdateFarmerProfileCommandHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<UpdateFarmerProfileResponse> Handle(UpdateFarmerProfileCommand request, CancellationToken cancellationToken)
    {
        var farmer = await _db.Farmers
            .FirstOrDefaultAsync(f => f.Id == request.FarmerId, cancellationToken)
            ?? throw new KeyNotFoundException($"Farmer {request.FarmerId} not found.");

        farmer.Name = request.Name;
        farmer.Language = request.Language;
        farmer.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return new UpdateFarmerProfileResponse(farmer.Id, farmer.Phone, farmer.Name, farmer.Language);
    }
}
