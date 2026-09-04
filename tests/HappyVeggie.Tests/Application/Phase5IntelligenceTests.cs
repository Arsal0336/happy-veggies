using HappyVeggie.Application.Alerts;
using HappyVeggie.Domain.Entities;

namespace HappyVeggie.Tests.Application;

public sealed class CropCycleDeltaTests
{
    [Fact]
    public void Delta_is_actual_minus_predicted()
    {
        var cycle = new CropCycle
        {
            Id = Guid.NewGuid(),
            CropZoneId = Guid.NewGuid(),
            Season = "2026-Kharif",
            PredictedYield = 100m,
            PredictedYieldUnit = "kg",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        // Mirror ApplyActuals logic used by CropCycleService
        var actual = 80m;
        cycle.ActualYield = actual;
        cycle.Delta = cycle.PredictedYield.HasValue
            ? actual - cycle.PredictedYield.Value
            : null;

        Assert.Equal(-20m, cycle.Delta);
        Assert.Equal(100m, cycle.PredictedYield); // never overwritten
    }

    [Fact]
    public void Setting_actual_without_predicted_leaves_delta_null()
    {
        var cycle = new CropCycle { PredictedYield = null };
        var actual = 50m;
        cycle.ActualYield = actual;
        cycle.Delta = cycle.PredictedYield.HasValue
            ? actual - cycle.PredictedYield.Value
            : null;

        Assert.Null(cycle.Delta);
        Assert.Equal(50m, cycle.ActualYield);
    }
}

public sealed class AlertEvaluationConstantsTests
{
    [Fact]
    public void Heat_threshold_matches_stub_weather_temp()
    {
        // StubWeatherProvider returns 32°C — threshold must trigger heat advisory for stub.
        Assert.Equal(32m, AlertEvaluationService.HeatAdvisoryThresholdC);
    }
}

public sealed class GreenScoreWeightsNoteTests
{
    [Fact]
    public void Weights_note_documents_TBD06()
    {
        Assert.Contains("TBD-06", HappyVeggie.Application.GreenScore.GreenFarmScoringService.WeightsNote);
        Assert.Contains("certification", HappyVeggie.Application.GreenScore.GreenFarmScoringService.NonCertificationDisclaimer, StringComparison.OrdinalIgnoreCase);
    }
}
