using HappyVeggie.Application.Soil.Dtos;
using MediatR;

namespace HappyVeggie.Application.Soil.ListSoilProfiles;

public sealed record ListSoilProfilesQuery(Guid FarmId) : IRequest<IReadOnlyList<SoilProfileDto>>;
