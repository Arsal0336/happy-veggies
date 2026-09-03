using HappyVeggie.Application.Common.Services;
using HappyVeggie.Application.DigitalTwin.Dtos;
using HappyVeggie.Application.DigitalTwin.Services;
using MediatR;

namespace HappyVeggie.Application.DigitalTwin.GetFarmTwin;

public sealed class GetFarmTwinQueryHandler : IRequestHandler<GetFarmTwinQuery, FarmTwinDto>
{
    private readonly FarmOwnershipGuard _ownershipGuard;
    private readonly DigitalTwinAssembler _assembler;

    public GetFarmTwinQueryHandler(FarmOwnershipGuard ownershipGuard, DigitalTwinAssembler assembler)
    {
        _ownershipGuard = ownershipGuard;
        _assembler = assembler;
    }

    public async Task<FarmTwinDto> Handle(GetFarmTwinQuery request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);
        return await _assembler.AssembleAsync(request.FarmId, cancellationToken);
    }
}
