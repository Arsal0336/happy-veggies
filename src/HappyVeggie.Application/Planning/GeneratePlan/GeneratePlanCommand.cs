using MediatR;

namespace HappyVeggie.Application.Planning.GeneratePlan;

public sealed record GeneratePlanCommand(Guid FarmId, Guid FarmerId, string Language) : IRequest<PlanDetailDto>;

public sealed record PlanDetailDto(
    Guid Id,
    Guid FarmId,
    int Version,
    string Language,
    string ContentJson,
    string? ContextUsedJson,
    DateTimeOffset CreatedAt);
