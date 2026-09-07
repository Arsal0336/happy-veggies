using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.Soil.Dtos;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Soil.ListSoilProfiles;

public sealed class ListSoilProfilesQueryHandler
    : IRequestHandler<ListSoilProfilesQuery, IReadOnlyList<SoilProfileDto>>
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;

    public ListSoilProfilesQueryHandler(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
    }

    public async Task<IReadOnlyList<SoilProfileDto>> Handle(
        ListSoilProfilesQuery request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        var rows = await _db.SoilProfiles
            .AsNoTracking()
            .Where(s => s.FarmId == request.FarmId && !s.IsDeleted)
            .ToListAsync(cancellationToken);

        return rows
            .OrderBy(s => s.CreatedAt)
            .Select(s => new SoilProfileDto(
                s.Id,
                s.FarmId,
                s.ProductionAreaId,
                s.SoilType,
                s.SoilTypeProvenance != null ? s.SoilTypeProvenance.Value.ToString() : null,
                s.Texture,
                s.TextureProvenance != null ? s.TextureProvenance.Value.ToString() : null,
                s.PhValue,
                s.PhValueProvenance != null ? s.PhValueProvenance.Value.ToString() : null,
                s.OrganicMatterValue,
                s.OrganicMatterProvenance != null ? s.OrganicMatterProvenance.Value.ToString() : null,
                s.NitrogenValue,
                s.NitrogenProvenance != null ? s.NitrogenProvenance.Value.ToString() : null,
                s.PhosphorusValue,
                s.PhosphorusProvenance != null ? s.PhosphorusProvenance.Value.ToString() : null,
                s.PotassiumValue,
                s.PotassiumProvenance != null ? s.PotassiumProvenance.Value.ToString() : null,
                s.FarmerNotes,
                s.CreatedAt,
                s.UpdatedAt))
            .ToList();
    }
}
