namespace HappyVeggie.Domain.Helpers;

/// <summary>
/// Converts yield / government-rate mass units for Pakistan farm economics.
/// Canonical mass is kilograms. Density units (per acre) need zone area in acres.
/// Pakistani maund = 40 kg.
/// </summary>
public static class YieldUnitConverter
{
    public const decimal KgPerMaund = 40m;
    public const decimal KgPerTon = 1000m;

    /// <summary>
    /// Convert a yield quantity into the rate's unit so ExpectedAmount = qty × RatePerUnit.
    /// Density yields (e.g. t/acre) are expanded with <paramref name="areaAcres"/>.
    /// Rate units should be mass totals (kg / maund / t), not density.
    /// </summary>
    public static decimal? ToRateUnit(
        decimal yieldValue,
        string? yieldUnit,
        string? rateUnit,
        decimal areaAcres)
    {
        var from = Normalize(yieldUnit);
        var to = Normalize(rateUnit);
        if (from is null || to is null)
            return null;

        // Pricing units are always total mass (never density).
        if (IsDensity(to.Value))
            to = MassOnly(to.Value);

        var kg = ToKilograms(yieldValue, from.Value, areaAcres);
        if (kg is null)
            return null;

        return FromKilogramsTotal(kg.Value, to.Value);
    }

    public static decimal? ToKilograms(decimal value, string? unit, decimal areaAcres)
    {
        var parsed = Normalize(unit);
        return parsed is null ? null : ToKilograms(value, parsed.Value, areaAcres);
    }

    public static string CanonicalCode(string? unit)
    {
        var parsed = Normalize(unit);
        return parsed switch
        {
            YieldUnitKind.Kg => "kg",
            YieldUnitKind.Maund => "maund",
            YieldUnitKind.Ton => "t",
            YieldUnitKind.KgPerAcre => "kg/acre",
            YieldUnitKind.MaundPerAcre => "maund/acre",
            YieldUnitKind.TonPerAcre => "t/acre",
            _ => string.IsNullOrWhiteSpace(unit) ? "kg" : unit.Trim().ToLowerInvariant()
        };
    }

    public static bool IsKnown(string? unit) => Normalize(unit) is not null;

    private static decimal? ToKilograms(decimal value, YieldUnitKind unit, decimal areaAcres)
    {
        return unit switch
        {
            YieldUnitKind.Kg => value,
            YieldUnitKind.Maund => value * KgPerMaund,
            YieldUnitKind.Ton => value * KgPerTon,
            YieldUnitKind.KgPerAcre => value * SafeAcres(areaAcres),
            YieldUnitKind.MaundPerAcre => value * KgPerMaund * SafeAcres(areaAcres),
            YieldUnitKind.TonPerAcre => value * KgPerTon * SafeAcres(areaAcres),
            _ => null
        };
    }

    private static decimal? FromKilogramsTotal(decimal kg, YieldUnitKind unit)
    {
        return unit switch
        {
            YieldUnitKind.Kg => kg,
            YieldUnitKind.Maund => kg / KgPerMaund,
            YieldUnitKind.Ton => kg / KgPerTon,
            YieldUnitKind.KgPerAcre => kg,
            YieldUnitKind.MaundPerAcre => kg / KgPerMaund,
            YieldUnitKind.TonPerAcre => kg / KgPerTon,
            _ => null
        };
    }

    private static bool IsDensity(YieldUnitKind unit) =>
        unit is YieldUnitKind.KgPerAcre or YieldUnitKind.MaundPerAcre or YieldUnitKind.TonPerAcre;

    private static YieldUnitKind MassOnly(YieldUnitKind unit) => unit switch
    {
        YieldUnitKind.KgPerAcre => YieldUnitKind.Kg,
        YieldUnitKind.MaundPerAcre => YieldUnitKind.Maund,
        YieldUnitKind.TonPerAcre => YieldUnitKind.Ton,
        _ => unit
    };

    private static decimal SafeAcres(decimal areaAcres) => areaAcres <= 0 ? 0m : areaAcres;

    private static YieldUnitKind? Normalize(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            return YieldUnitKind.Kg;

        var u = raw.Trim().ToLowerInvariant()
            .Replace(" ", "")
            .Replace("_", "");

        u = u.Replace("per", "/");
        while (u.Contains("//"))
            u = u.Replace("//", "/");

        u = u switch
        {
            "kilogram" or "kilograms" or "kgs" => "kg",
            "ton" or "tons" or "tonne" or "tonnes" or "mt" => "t",
            "maunds" or "mann" or "man" => "maund",
            "kg/ac" or "kgs/acre" or "kgacre" => "kg/acre",
            "t/ac" or "ton/acre" or "tons/acre" or "tonne/acre" or "tacre" => "t/acre",
            "maund/ac" or "maunds/acre" or "mann/acre" => "maund/acre",
            _ => u
        };

        return u switch
        {
            "kg" => YieldUnitKind.Kg,
            "maund" => YieldUnitKind.Maund,
            "t" => YieldUnitKind.Ton,
            "kg/acre" => YieldUnitKind.KgPerAcre,
            "maund/acre" => YieldUnitKind.MaundPerAcre,
            "t/acre" => YieldUnitKind.TonPerAcre,
            _ => null
        };
    }

    private enum YieldUnitKind
    {
        Kg,
        Maund,
        Ton,
        KgPerAcre,
        MaundPerAcre,
        TonPerAcre
    }
}
