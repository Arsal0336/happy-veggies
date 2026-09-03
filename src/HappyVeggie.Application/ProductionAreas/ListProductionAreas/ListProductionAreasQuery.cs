using HappyVeggie.Application.ProductionAreas.Dtos;
using MediatR;

namespace HappyVeggie.Application.ProductionAreas.ListProductionAreas;

public sealed record ListProductionAreasQuery(Guid FarmId) : IRequest<IReadOnlyList<ProductionAreaDetailDto>>;
