using HappyVeggie.Domain.Helpers;
using Xunit;

namespace HappyVeggie.Tests.Domain;

public sealed class YieldUnitConverterTests
{
    [Fact]
    public void Converts_ton_per_acre_to_kg_for_rate()
    {
        // 18 t/acre × 2 acres = 36 t = 36_000 kg
        var qty = YieldUnitConverter.ToRateUnit(18m, "t/acre", "kg", areaAcres: 2m);
        Assert.Equal(36_000m, qty);
    }

    [Fact]
    public void Converts_kg_to_maund_for_rate()
    {
        var qty = YieldUnitConverter.ToRateUnit(400m, "kg", "maund", areaAcres: 1m);
        Assert.Equal(10m, qty);
    }

    [Fact]
    public void Same_unit_passthrough()
    {
        var qty = YieldUnitConverter.ToRateUnit(85m, "kg", "kg", areaAcres: 1m);
        Assert.Equal(85m, qty);
    }
}
