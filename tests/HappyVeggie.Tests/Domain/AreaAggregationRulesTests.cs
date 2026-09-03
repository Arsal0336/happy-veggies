using HappyVeggie.Domain.Helpers;

namespace HappyVeggie.Tests.Domain;

public class AreaAggregationRulesTests
{
    [Fact]
    public void IsLandType_OpenField_ReturnsTrue()
    {
        Assert.True(AreaAggregationRules.IsLandType("open_field"));
    }

    [Fact]
    public void IsLandType_Shed_ReturnsFalse()
    {
        Assert.False(AreaAggregationRules.IsLandType("shed"));
    }

    [Fact]
    public void ValidateLandSum_UnderLimit_IsValid()
    {
        var areas = new[] { ("open_field", 3m), ("experimental", 2m) };
        var result = AreaAggregationRules.ValidateLandSum(10m, areas);
        Assert.True(result.IsValid);
        Assert.Equal(5m, result.TotalLandAcres);
    }

    [Fact]
    public void ValidateLandSum_OverLimit_IsInvalid()
    {
        var areas = new[] { ("open_field", 8m), ("experimental", 4m) };
        var result = AreaAggregationRules.ValidateLandSum(10m, areas);
        Assert.False(result.IsValid);
    }

    [Fact]
    public void ValidateLandSum_WithinTolerance_IsValid()
    {
        // 10 acres * 1.01 = 10.1, so 10.05 should pass
        var areas = new[] { ("open_field", 10.05m) };
        var result = AreaAggregationRules.ValidateLandSum(10m, areas);
        Assert.True(result.IsValid);
    }

    [Fact]
    public void ValidateLandSum_IgnoresCoveredTypes()
    {
        var areas = new[] { ("open_field", 5m), ("shed", 500m), ("greenhouse", 1000m) };
        var result = AreaAggregationRules.ValidateLandSum(10m, areas);
        Assert.True(result.IsValid);
        Assert.Equal(5m, result.TotalLandAcres);
    }
}
