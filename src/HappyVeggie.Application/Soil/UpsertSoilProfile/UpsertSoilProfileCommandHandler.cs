using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.Soil.Dtos;
using HappyVeggie.Domain.Entities;
using HappyVeggie.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Soil.UpsertSoilProfile;

public sealed class UpsertSoilProfileCommandHandler
    : IRequestHandler<UpsertSoilProfileCommand, SoilProfileDto>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public UpsertSoilProfileCommandHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<SoilProfileDto> Handle(
        UpsertSoilProfileCommand request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        if (request.ProductionAreaId is Guid areaId)
        {
            var areaExists = await _db.ProductionAreas
                .AsNoTracking()
                .AnyAsync(a => a.Id == areaId && a.FarmId == request.FarmId && !a.IsDeleted, cancellationToken);
            if (!areaExists)
                throw new KeyNotFoundException($"Production area {areaId} not found for farm.");
        }

        // Include soft-deleted so unique (FarmId, ProductionAreaId) can be revived on upsert.
        var profile = await _db.SoilProfiles
            .FirstOrDefaultAsync(
                s => s.FarmId == request.FarmId && s.ProductionAreaId == request.ProductionAreaId,
                cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var measured = DataProvenance.ObservedMeasured;

        if (profile is null)
        {
            profile = new SoilProfile
            {
                Id = Guid.NewGuid(),
                FarmId = request.FarmId,
                ProductionAreaId = request.ProductionAreaId,
                CreatedAt = now
            };
            _db.SoilProfiles.Add(profile);
        }

        profile.IsDeleted = false;
        profile.SoilType = request.SoilType;
        profile.SoilTypeProvenance = ResolveProvenance(request.SoilType, request.SoilTypeProvenance, measured);
        profile.Texture = request.Texture;
        profile.TextureProvenance = ResolveProvenance(request.Texture, request.TextureProvenance, measured);
        profile.PhValue = request.PhValue;
        profile.PhValueProvenance = ResolveProvenance(request.PhValue, request.PhValueProvenance, measured);
        profile.OrganicMatterValue = request.OrganicMatterValue;
        profile.OrganicMatterProvenance = ResolveProvenance(request.OrganicMatterValue, request.OrganicMatterProvenance, measured);
        profile.NitrogenValue = request.NitrogenValue;
        profile.NitrogenProvenance = ResolveProvenance(request.NitrogenValue, request.NitrogenProvenance, measured);
        profile.PhosphorusValue = request.PhosphorusValue;
        profile.PhosphorusProvenance = ResolveProvenance(request.PhosphorusValue, request.PhosphorusProvenance, measured);
        profile.PotassiumValue = request.PotassiumValue;
        profile.PotassiumProvenance = ResolveProvenance(request.PotassiumValue, request.PotassiumProvenance, measured);
        profile.FarmerNotes = request.FarmerNotes;
        profile.UpdatedAt = now;

        await _db.SaveChangesAsync(cancellationToken);

        return new SoilProfileDto(
            profile.Id,
            profile.FarmId,
            profile.ProductionAreaId,
            profile.SoilType,
            profile.SoilTypeProvenance?.ToString(),
            profile.Texture,
            profile.TextureProvenance?.ToString(),
            profile.PhValue,
            profile.PhValueProvenance?.ToString(),
            profile.OrganicMatterValue,
            profile.OrganicMatterProvenance?.ToString(),
            profile.NitrogenValue,
            profile.NitrogenProvenance?.ToString(),
            profile.PhosphorusValue,
            profile.PhosphorusProvenance?.ToString(),
            profile.PotassiumValue,
            profile.PotassiumProvenance?.ToString(),
            profile.FarmerNotes,
            profile.CreatedAt,
            profile.UpdatedAt);
    }

    private static DataProvenance? ResolveProvenance<T>(T? value, string? provenance, DataProvenance farmerDefault)
    {
        if (value is null)
            return null;

        if (provenance is not null && Enum.TryParse<DataProvenance>(provenance, true, out var parsed))
            return parsed;

        // Farmer-entered soil values default to ObservedMeasured (measured inputs).
        return farmerDefault;
    }
}
