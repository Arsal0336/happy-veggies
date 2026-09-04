using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.Compatibility;
using HappyVeggie.Application.NeighbourEdges.Dtos;
using MediatR;

namespace HappyVeggie.Application.NeighbourEdges.ListNeighbourWarnings;

public sealed class ListNeighbourWarningsQueryHandler
    : IRequestHandler<ListNeighbourWarningsQuery, IReadOnlyList<NeighbourWarningDto>>
{
    private readonly FarmOwnershipGuard _ownershipGuard;
    private readonly CompatibilityService _compatibility;

    public ListNeighbourWarningsQueryHandler(
        FarmOwnershipGuard ownershipGuard,
        CompatibilityService compatibility)
    {
        _ownershipGuard = ownershipGuard;
        _compatibility = compatibility;
    }

    public async Task<IReadOnlyList<NeighbourWarningDto>> Handle(
        ListNeighbourWarningsQuery request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        var warnings = await _compatibility.CheckNeighboursAsync(request.FarmId, cancellationToken);
        return warnings.Select(w => new NeighbourWarningDto(
            w.ZoneAId, w.ZoneALabel, w.ZoneBId, w.ZoneBLabel, w.Reason)).ToList();
    }
}
