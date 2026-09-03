using HappyVeggie.Domain.Entities;

namespace HappyVeggie.Tests.Domain;

/// <summary>
/// FR-103: Compatibility pair order — (A,B) == (B,A).
/// </summary>
public class CompatibilityOrderTests
{
    [Fact]
    public void CompatibilityRelation_HasExpectedValues()
    {
        Assert.Equal(0, (int)CropCompatibilityRelation.Good);
        Assert.Equal(1, (int)CropCompatibilityRelation.Avoid);
        Assert.Equal(2, (int)CropCompatibilityRelation.Neutral);
    }

    [Fact]
    public void CompatibilityScope_HasExpectedValues()
    {
        Assert.Equal(0, (int)CropCompatibilityScope.OnFarmNeighbour);
        Assert.Equal(1, (int)CropCompatibilityScope.Portfolio);
    }
}
