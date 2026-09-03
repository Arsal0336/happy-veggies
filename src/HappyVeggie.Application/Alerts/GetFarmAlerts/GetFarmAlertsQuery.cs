using MediatR;

namespace HappyVeggie.Application.Alerts.GetFarmAlerts;

public sealed record GetFarmAlertsQuery(Guid FarmId) : IRequest<IReadOnlyList<FarmAlertDto>>;

public sealed record FarmAlertDto(
    string Type,
    string Severity,
    string Message,
    string? TargetId,
    DateTimeOffset CreatedAt);
