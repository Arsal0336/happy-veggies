using System.Security.Claims;
using HappyVeggie.Application.Common.Interfaces;

namespace HappyVeggie.Api.Services;

public sealed class CurrentFarmerService : ICurrentFarmerService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentFarmerService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? FarmerId
    {
        get
        {
            var sub = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return sub is not null && Guid.TryParse(sub, out var id) ? id : null;
        }
    }

    public bool IsAuthenticated => FarmerId.HasValue;
}
