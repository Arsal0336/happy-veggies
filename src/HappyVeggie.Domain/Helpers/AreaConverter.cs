using HappyVeggie.Domain.Enums;

namespace HappyVeggie.Domain.Helpers;

/// <summary>
/// Converts between area units. Canonical storage:
///   Land (open_field, experimental): acres
///   Covered (shed, greenhouse, tunnel_polyhouse, other_protected): sq ft
/// </summary>
public static class AreaConverter
{
    // All factors relative to 1 acre.
    private static readonly Dictionary<AreaUnit, decimal> ToAcreFactor = new()
    {
        [AreaUnit.Acre] = 1m,
        [AreaUnit.Kanal] = 0.125m,          // 1 kanal = 1/8 acre
        [AreaUnit.Marla] = 0.00625m,        // 1 marla = 1/160 acre (20 marla = 1 kanal)
        [AreaUnit.Hectare] = 2.47105m,
        [AreaUnit.SquareFeet] = 1m / 43560m,
        [AreaUnit.SquareMeters] = 1m / 4046.8564224m,
    };

    /// <summary>Convert a value from <paramref name="from"/> to <paramref name="to"/>.</summary>
    public static decimal Convert(decimal value, AreaUnit from, AreaUnit to)
    {
        if (from == to) return value;

        var acres = value * ToAcreFactor[from];
        return acres / ToAcreFactor[to];
    }

    /// <summary>Convert to canonical acres.</summary>
    public static decimal ToAcres(decimal value, AreaUnit unit) => Convert(value, unit, AreaUnit.Acre);

    /// <summary>Convert to canonical sq ft.</summary>
    public static decimal ToSquareFeet(decimal value, AreaUnit unit) => Convert(value, unit, AreaUnit.SquareFeet);

    /// <summary>
    /// Convert input to the appropriate canonical unit based on production area category.
    /// Land categories → acres; covered categories → sq ft.
    /// </summary>
    public static (decimal CanonicalValue, AreaUnit CanonicalUnit) ToCanonical(
        decimal value,
        AreaUnit inputUnit,
        bool isCoveredCategory)
    {
        if (isCoveredCategory)
            return (ToSquareFeet(value, inputUnit), AreaUnit.SquareFeet);

        return (ToAcres(value, inputUnit), AreaUnit.Acre);
    }
}
