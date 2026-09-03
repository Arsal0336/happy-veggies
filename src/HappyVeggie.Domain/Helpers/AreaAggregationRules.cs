namespace HappyVeggie.Domain.Helpers;

/// <summary>
/// Validates that the sum of production area sizes does not exceed the farm total.
/// Land (open_field, experimental) sums in acres against farm AreaAcres.
/// Covered (shed, greenhouse, tunnel_polyhouse, other_protected) sums separately in sq ft (no farm-level cap enforced by default).
/// Tolerance: 1% to account for rounding.
/// </summary>
public static class AreaAggregationRules
{
    private static readonly HashSet<string> LandTypeCodes = new(StringComparer.OrdinalIgnoreCase)
    {
        "open_field",
        "experimental"
    };

    private const decimal Tolerance = 0.01m; // 1%

    public static bool IsLandType(string typeCode) => LandTypeCodes.Contains(typeCode);

    /// <summary>
    /// Validates that the total land-area (acres) of open_field + experimental areas
    /// does not exceed the farm's total AreaAcres (with tolerance).
    /// </summary>
    public static AreaValidationResult ValidateLandSum(
        decimal farmAreaAcres,
        IEnumerable<(string TypeCode, decimal CanonicalAcres)> areas)
    {
        var landSum = areas
            .Where(a => IsLandType(a.TypeCode))
            .Sum(a => a.CanonicalAcres);

        var limit = farmAreaAcres * (1 + Tolerance);
        var isValid = landSum <= limit;

        return new AreaValidationResult(isValid, landSum, farmAreaAcres);
    }
}

public sealed record AreaValidationResult(bool IsValid, decimal TotalLandAcres, decimal FarmAreaAcres);
