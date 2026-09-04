using MediatR;

namespace HappyVeggie.Application.Alerts.GetFarmAlerts;

public sealed record GetFarmAlertsQuery(Guid FarmId) : IRequest<IReadOnlyList<FarmAlertDto>>;

public sealed record FarmAlertDto(
    Guid Id,
    string Type,
    string Severity,
    string Title,
    string Body,
    bool IsRead,
    string? SourceSignal,
    DateTimeOffset CreatedAt);
