using MediatR;

namespace HappyVeggie.Application.ProductionAreas.DeleteProductionArea;

public sealed record DeleteProductionAreaCommand(Guid FarmId, Guid AreaId) : IRequest<Unit>;
