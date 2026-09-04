namespace HappyVeggie.Application.Common.Interfaces;

public interface IFeatureFlagService
{
    Task<bool> GetBoolAsync(string key, bool defaultValue = false, CancellationToken cancellationToken = default);
}
