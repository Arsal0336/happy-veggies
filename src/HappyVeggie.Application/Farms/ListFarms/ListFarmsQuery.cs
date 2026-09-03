using HappyVeggie.Application.Farms.Dtos;
using MediatR;

namespace HappyVeggie.Application.Farms.ListFarms;

public sealed record ListFarmsQuery(Guid FarmerId) : IRequest<IReadOnlyList<FarmDto>>;
