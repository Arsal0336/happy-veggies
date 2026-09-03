using HappyVeggie.Application.Common.Services;
using MediatR;

namespace HappyVeggie.Application.Planning.GeneratePlan;

public sealed class GeneratePlanCommandHandler : IRequestHandler<GeneratePlanCommand, PlanDetailDto>
{
    private readonly FarmOwnershipGuard _ownershipGuard;
    private readonly CropPlanningService _planningService;

    public GeneratePlanCommandHandler(FarmOwnershipGuard ownershipGuard, CropPlanningService planningService)
    {
        _ownershipGuard = ownershipGuard;
        _planningService = planningService;
    }

    public async Task<PlanDetailDto> Handle(GeneratePlanCommand request, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(request.FarmId, cancellationToken);

        var plan = await _planningService.GeneratePlanAsync(
            request.FarmId, request.FarmerId, request.Language, cancellationToken);

        return new PlanDetailDto(
            plan.Id, plan.FarmId, plan.Version,
            plan.Language, plan.ContentJson, plan.ContextUsedJson,
            plan.CreatedAt);
    }
}
