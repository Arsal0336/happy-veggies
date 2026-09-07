namespace HappyVeggie.Domain.Helpers;

/// <summary>
/// Lightweight coordinate → region mapping for Pakistan farm onboarding (FR-010).
/// </summary>
public static class RegionLookup
{
    public static RegionSuggestion Suggest(double lat, double lng)
    {
        if (lat is >= 33.45 and <= 33.85 && lng is >= 72.85 and <= 73.25)
        {
            return new RegionSuggestion("ISB", "Islamabad");
        }

        if (lat is >= 33.45 and <= 33.75 && lng is >= 73.00 and <= 73.35)
        {
            return new RegionSuggestion("RWP", "Rawalpindi");
        }

        if (lat is >= 31.20 and <= 31.80 && lng is >= 74.10 and <= 74.60)
        {
            return new RegionSuggestion("LHR", "Lahore");
        }

        if (lat is >= 24.70 and <= 25.10 && lng is >= 66.90 and <= 67.30)
        {
            return new RegionSuggestion("KHI", "Karachi");
        }

        if (lat is >= 33.90 and <= 34.20 && lng is >= 71.40 and <= 71.80)
        {
            return new RegionSuggestion("PEW", "Peshawar");
        }

        if (lat is >= 30.00 and <= 32.80 && lng is >= 73.50 and <= 75.50)
        {
            return new RegionSuggestion("PUN", "Punjab");
        }

        if (lat is >= 24.00 and <= 28.50 && lng is >= 66.00 and <= 71.00)
        {
            return new RegionSuggestion("SIN", "Sindh");
        }

        if (lat is >= 33.00 and <= 37.00 && lng is >= 70.00 and <= 74.00)
        {
            return new RegionSuggestion("KPK", "Khyber Pakhtunkhwa");
        }

        if (lat is >= 25.00 and <= 32.00 && lng is >= 61.00 and <= 70.00)
        {
            return new RegionSuggestion("BAL", "Balochistan");
        }

        return new RegionSuggestion("PK", "Pakistan");
    }
}

public sealed record RegionSuggestion(string RegionCode, string RegionLabel);
