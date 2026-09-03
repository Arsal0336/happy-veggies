namespace HappyVeggie.Application.Common.Interfaces;

public interface ICurrentFarmerService
{
    Guid? FarmerId { get; }
    bool IsAuthenticated { get; }
}
