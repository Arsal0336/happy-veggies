using HappyVeggie.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Application.Suggestions;

/// <summary>
/// Ranks seed varieties for a crop based on risk band and maturity.
/// </summary>
public sealed class SeedVarietySuggestionService
{
    private readonly IApplicationDbContext _db;

    public SeedVarietySuggestionService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<SeedVarietySuggestionDto>> SuggestAsync(
        string cropId,
        CancellationToken cancellationToken)
    {
        var varieties = await _db.SeedVarieties
            .AsNoTracking()
            .Where(v => v.CropId == cropId && v.Enabled)
            .OrderBy(v => v.RiskBand)
            .ThenBy(v => v.MaturityDays)
            .Select(v => new SeedVarietySuggestionDto(
                v.Id, v.NameEn, v.NameUr,
                v.VarietyType.ToString(),
                v.RiskBand != null ? v.RiskBand.Value.ToString() : "Unknown",
                v.MaturityDays,
                v.SoilNotes, v.WaterNotes, v.DiseaseResistanceNotes))
            .ToListAsync(cancellationToken);

        return varieties;
    }
}

public sealed record SeedVarietySuggestionDto(
    string Id, string NameEn, string NameUr,
    string VarietyType, string RiskBand,
    int? MaturityDays,
    string? SoilNotes, string? WaterNotes, string? DiseaseResistanceNotes);
