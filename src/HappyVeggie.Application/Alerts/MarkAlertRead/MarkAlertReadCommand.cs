using MediatR;

namespace HappyVeggie.Application.Alerts.MarkAlertRead;

public sealed record MarkAlertReadCommand(Guid FarmId, Guid AlertId) : IRequest<Unit>;
