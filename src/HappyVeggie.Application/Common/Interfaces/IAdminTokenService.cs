using HappyVeggie.Domain.Entities;

namespace HappyVeggie.Application.Common.Interfaces;

public interface IAdminTokenService
{
    string GenerateAdminToken(AdminUser admin);
}
