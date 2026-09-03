using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Auth.VerifyOtp;

public sealed class VerifyOtpCommandHandler : IRequestHandler<VerifyOtpCommand, VerifyOtpResponse>
{
    private readonly IOtpService _otpService;
    private readonly ITokenService _tokenService;
    private readonly IApplicationDbContext _db;

    public VerifyOtpCommandHandler(IOtpService otpService, ITokenService tokenService, IApplicationDbContext db)
    {
        _otpService = otpService;
        _tokenService = tokenService;
        _db = db;
    }

    public async Task<VerifyOtpResponse> Handle(VerifyOtpCommand request, CancellationToken cancellationToken)
    {
        var isValid = await _otpService.VerifyOtpAsync(request.RequestId, request.Phone, request.Code, cancellationToken);
        if (!isValid)
        {
            throw new UnauthorizedAccessException("Invalid or expired OTP code.");
        }

        var farmer = await _db.Farmers
            .FirstOrDefaultAsync(f => f.Phone == request.Phone, cancellationToken);

        var isNew = farmer is null;

        if (isNew)
        {
            farmer = new Farmer
            {
                Id = Guid.NewGuid(),
                Phone = request.Phone,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };
            _db.Farmers.Add(farmer);
            await _db.SaveChangesAsync(cancellationToken);
        }

        var token = _tokenService.GenerateFarmerToken(farmer!);

        var dto = new VerifyOtpFarmerDto(farmer!.Id, farmer.Phone, farmer.Name, farmer.Language);
        return new VerifyOtpResponse(token, dto, isNew);
    }
}
