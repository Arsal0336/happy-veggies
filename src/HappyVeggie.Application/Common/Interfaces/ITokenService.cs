using HappyVeggie.Domain.Entities;

namespace HappyVeggie.Application.Common.Interfaces;

public interface ITokenService
{
    string GenerateFarmerToken(Farmer farmer);
}
