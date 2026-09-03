using HappyVeggie.Application.Planning.GeneratePlan;
using MediatR;

namespace HappyVeggie.Application.Planning.ListPlanHistory;

public sealed record ListPlanHistoryQuery(Guid FarmId) : IRequest<IReadOnlyList<PlanDetailDto>>;
