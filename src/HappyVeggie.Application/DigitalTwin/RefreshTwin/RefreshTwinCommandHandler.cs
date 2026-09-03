using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.DigitalTwin.Dtos;
using HappyVeggie.Application.DigitalTwin.Services;
using HappyVeggie.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.DigitalTwin.RefreshTwin;

public sealed class RefreshTwinCommandHandler : IRequestHandler<RefreshTwinCommand, FarmTwinDto>
{
    private readonly FarmOwnershipGuard _ownershipGuard;
    private readonly DigitalTwinAssembler _assembler;
    private readonly IApplicationDbContext _db;

    public RefreshTwinCommandHandler(
        FarmOwnershipGuard ownershipGuard,
        DigitalTwinAssembler assembler,
        IApplicationDbContext db)
    {
        _ownershipGuard = ownershipGuard;
        _assembler = assembler;
        _db = db;
    }

    public async Task<FarmTwinDto> Handle(RefreshTwinCommand request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        // Update or create the TwinSnapshot record with a fresh timestamp.
        // Provider enrichment (weather, soil) will be wired in TASK-071/072.
        var snapshot = await _db.TwinSnapshots
            .FirstOrDefaultAsync(t => t.FarmId == request.FarmId, cancellationToken);

        if (snapshot is null)
        {
            snapshot = new TwinSnapshot
            {
                Id = Guid.NewGuid(),
                FarmId = request.FarmId,
                TwinJson = "{}",
                RefreshedAt = DateTimeOffset.UtcNow,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
                WeatherProviderStatus = "stub",
                SoilProviderStatus = "stub"
            };
            _db.TwinSnapshots.Add(snapshot);
        }
        else
        {
            snapshot.RefreshedAt = DateTimeOffset.UtcNow;
            snapshot.UpdatedAt = DateTimeOffset.UtcNow;
            snapshot.WeatherProviderStatus = "stub";
            snapshot.SoilProviderStatus = "stub";
        }

        await _db.SaveChangesAsync(cancellationToken);

        return await _assembler.AssembleAsync(request.FarmId, cancellationToken);
    }
}
