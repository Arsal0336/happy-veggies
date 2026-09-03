using HappyVeggie.Domain.Enums;
using HappyVeggie.Domain.Helpers;

namespace HappyVeggie.Tests.Domain;

public class AreaConverterTests
{
    [Fact]
    public void ToAcres_FromKanal_ConvertsCorrectly()
    {
        var result = AreaConverter.ToAcres(8m, AreaUnit.Kanal);
        Assert.Equal(1m, result);
    }

    [Fact]
    public void ToAcres_FromMarla_ConvertsCorrectly()
    {
        var result = AreaConverter.ToAcres(160m, AreaUnit.Marla);
        Assert.Equal(1m, result);
    }

    [Fact]
    public void ToAcres_FromAcre_ReturnsSame()
    {
        var result = AreaConverter.ToAcres(5m, AreaUnit.Acre);
        Assert.Equal(5m, result);
    }

    [Fact]
    public void ToSquareFeet_FromAcre_ConvertsCorrectly()
    {
        var result = AreaConverter.ToSquareFeet(1m, AreaUnit.Acre);
        Assert.InRange(result, 43559m, 43561m);
    }

    [Fact]
    public void Convert_SameUnit_ReturnsSame()
    {
        var result = AreaConverter.Convert(10m, AreaUnit.Kanal, AreaUnit.Kanal);
        Assert.Equal(10m, result);
    }

    [Fact]
    public void ToCanonical_LandType_ReturnsAcres()
    {
        var (value, unit) = AreaConverter.ToCanonical(8m, AreaUnit.Kanal, isCoveredCategory: false);
        Assert.Equal(AreaUnit.Acre, unit);
        Assert.Equal(1m, value);
    }

    [Fact]
    public void ToCanonical_CoveredType_ReturnsSqFt()
    {
        var (value, unit) = AreaConverter.ToCanonical(1m, AreaUnit.Acre, isCoveredCategory: true);
        Assert.Equal(AreaUnit.SquareFeet, unit);
        Assert.InRange(value, 43559m, 43561m);
    }
}
