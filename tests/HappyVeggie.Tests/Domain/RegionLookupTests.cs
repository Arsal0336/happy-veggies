using HappyVeggie.Domain.Enums;
using HappyVeggie.Domain.Helpers;

namespace HappyVeggie.Tests.Domain;

public class RegionLookupTests
{
    [Fact]
    public void TC_FR_010_IslamabadCoordinates_SuggestIslamabad()
    {
        var result = RegionLookup.Suggest(33.6844, 73.0479);
        Assert.Equal("ISB", result.RegionCode);
        Assert.Equal("Islamabad", result.RegionLabel);
    }

    [Fact]
    public void TC_FR_009_KanalConversion_MatchesTwoKanalEqualsQuarterAcre()
    {
        var acres = AreaConverter.ToAcres(2m, AreaUnit.Kanal);
        Assert.Equal(0.25m, acres);
    }

    [Fact]
    public void TC_FR_009_MarlaConversion_MatchesFortyMarlaEqualsQuarterAcre()
    {
        var acres = AreaConverter.ToAcres(40m, AreaUnit.Marla);
        Assert.Equal(0.25m, acres);
    }
}
