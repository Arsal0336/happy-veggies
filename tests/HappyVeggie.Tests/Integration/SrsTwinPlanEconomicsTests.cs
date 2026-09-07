using System.Net.Http.Json;
using System.Text.Json;

namespace HappyVeggie.Tests.Integration;

[Collection("Integration")]
public sealed class SrsTwinPlanEconomicsTests
{
    private readonly HttpClient _client;

    public SrsTwinPlanEconomicsTests(HappyVeggieWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task AuthenticateDemoFarmerAsync()
    {
        var token = await AuthTestHelper.LoginAsync(_client, "+923001234567");
        AuthTestHelper.UseBearer(_client, token);
    }

    private static bool TryGet(JsonElement element, string name, out JsonElement value)
    {
        if (element.TryGetProperty(name, out value))
        {
            return true;
        }

        foreach (var prop in element.EnumerateObject())
        {
            if (string.Equals(prop.Name, name, StringComparison.OrdinalIgnoreCase))
            {
                value = prop.Value;
                return true;
            }
        }

        value = default;
        return false;
    }

    [Fact(DisplayName = "TC-FR-024 Twin summary supports dashboard grounding")]
    public async Task TC_FR_024_TwinSummary_IncludesProductionAreas()
    {
        await AuthenticateDemoFarmerAsync();

        var twin = await _client.GetAsync($"/api/v1/farms/{DemoIds.DemoFarmId}/twin");
        twin.EnsureSuccessStatusCode();
        var json = await twin.Content.ReadAsStringAsync();
        var body = JsonDocument.Parse(json).RootElement;

        Assert.True(TryGet(body, "areas", out var areas) && areas.ValueKind == JsonValueKind.Array && areas.GetArrayLength() > 0, json);
        Assert.True(TryGet(body, "zones", out var zones) && zones.ValueKind == JsonValueKind.Array && zones.GetArrayLength() > 0, json);
        Assert.True(TryGet(body, "farm", out _), json);
    }

    [Fact(DisplayName = "TC-FR-022 Twin includes ecosystem state")]
    public async Task TC_FR_022_Twin_IncludesWeatherWaterSoilAndGreenSummary()
    {
        await AuthenticateDemoFarmerAsync();

        var twin = await _client.GetAsync($"/api/v1/farms/{DemoIds.DemoFarmId}/twin");
        twin.EnsureSuccessStatusCode();
        var body = await twin.Content.ReadFromJsonAsync<JsonElement>();

        Assert.True(body.TryGetProperty("weather", out _));
        Assert.True(body.TryGetProperty("waterSummary", out var water) && water.GetProperty("sourceCount").GetInt32() > 0);
        Assert.True(body.TryGetProperty("soilSummary", out _));
        Assert.True(body.TryGetProperty("greenSummary", out _));
    }

    [Fact(DisplayName = "TC-FR-023 Twin refresh updates timestamp")]
    public async Task TC_FR_023_TwinRefresh_UpdatesRefreshedAt()
    {
        await AuthenticateDemoFarmerAsync();

        var before = await _client.GetAsync($"/api/v1/farms/{DemoIds.DemoFarmId}/twin");
        before.EnsureSuccessStatusCode();
        var beforeBody = await before.Content.ReadFromJsonAsync<JsonElement>();
        var beforeTs = beforeBody.GetProperty("twinRefreshedAt").GetString();

        var refresh = await _client.PostAsync($"/api/v1/farms/{DemoIds.DemoFarmId}/twin/refresh", content: null);
        refresh.EnsureSuccessStatusCode();
        var afterBody = await refresh.Content.ReadFromJsonAsync<JsonElement>();
        var afterTs = afterBody.GetProperty("twinRefreshedAt").GetString();

        Assert.False(string.IsNullOrWhiteSpace(afterTs));
        Assert.NotEqual(beforeTs, afterTs);
    }

    [Fact(DisplayName = "TC-FR-035 Custom plan generation")]
    public async Task TC_FR_035_PlanGeneration_ReturnsStructuredSections()
    {
        await AuthenticateDemoFarmerAsync();

        var plan = await _client.PostAsJsonAsync($"/api/v1/farms/{DemoIds.DemoFarmId}/plan", new { language = "en" });
        plan.EnsureSuccessStatusCode();
        var body = await plan.Content.ReadFromJsonAsync<JsonElement>();
        var contentJson = body.GetProperty("contentJson").GetString()!;

        Assert.Contains("planSections", contentJson, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("stub plan", contentJson, StringComparison.OrdinalIgnoreCase);
    }

    [Fact(DisplayName = "TC-FR-025 No raw machine output in plan")]
    public async Task TC_FR_025_PlanContent_IsHumanReadableNotRawBlob()
    {
        await AuthenticateDemoFarmerAsync();

        var plan = await _client.PostAsJsonAsync($"/api/v1/farms/{DemoIds.DemoFarmId}/plan", new { language = "en" });
        plan.EnsureSuccessStatusCode();
        var body = await plan.Content.ReadFromJsonAsync<JsonElement>();
        var contentJson = body.GetProperty("contentJson").GetString()!;

        Assert.DoesNotContain("stack trace", contentJson, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("Exception", contentJson, StringComparison.OrdinalIgnoreCase);
        using var doc = JsonDocument.Parse(contentJson);
        Assert.True(doc.RootElement.TryGetProperty("planSections", out var sections));
        Assert.True(sections.GetArrayLength() > 0);
    }

    [Fact(DisplayName = "TC-FR-056 Reference gross value labeled historical")]
    public async Task TC_FR_056_Economics_IncludesHistoricalDisclaimer()
    {
        await AuthenticateDemoFarmerAsync();

        var econ = await _client.GetAsync($"/api/v1/farms/{DemoIds.DemoFarmId}/economics");
        econ.EnsureSuccessStatusCode();
        var body = await econ.Content.ReadFromJsonAsync<JsonElement>();

        Assert.Contains("historical", body.GetProperty("disclaimer").GetString(), StringComparison.OrdinalIgnoreCase);
        Assert.Equal("historical_reference", body.GetProperty("ratesLabel").GetString());
    }

    [Fact(DisplayName = "TC-FR-095 Explainable Green Farm Score")]
    public async Task TC_FR_095_GreenScore_IncludesFactorsAndDisclaimer()
    {
        await AuthenticateDemoFarmerAsync();

        var twin = await _client.GetAsync($"/api/v1/farms/{DemoIds.DemoFarmId}/twin");
        twin.EnsureSuccessStatusCode();
        var green = (await twin.Content.ReadFromJsonAsync<JsonElement>())!.GetProperty("greenSummary");

        Assert.True(green.TryGetProperty("overallScore", out _));
        Assert.True(green.TryGetProperty("factors", out var factors) && factors.GetArrayLength() > 0);
        Assert.Contains("not a certification", green.GetProperty("nonCertificationDisclaimer").GetString(), StringComparison.OrdinalIgnoreCase);
    }

    [Fact(DisplayName = "TC-FR-098 No certification claims in Green Score")]
    public async Task TC_FR_098_GreenScore_DisclaimerStatesNotCertification()
    {
        await AuthenticateDemoFarmerAsync();

        var twin = await _client.GetAsync($"/api/v1/farms/{DemoIds.DemoFarmId}/twin");
        twin.EnsureSuccessStatusCode();
        var disclaimer = (await twin.Content.ReadFromJsonAsync<JsonElement>())!
            .GetProperty("greenSummary")
            .GetProperty("nonCertificationDisclaimer")
            .GetString();

        Assert.Contains("not a certification", disclaimer, StringComparison.OrdinalIgnoreCase);
    }

    [Fact(DisplayName = "TC-FR-070/071 Alerts persist with read state")]
    public async Task TC_FR_070_071_Alerts_ListAndMarkRead()
    {
        await AuthenticateDemoFarmerAsync();

        var alerts = await _client.GetAsync($"/api/v1/farms/{DemoIds.DemoFarmId}/alerts");
        alerts.EnsureSuccessStatusCode();
        var list = await alerts.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(list.GetArrayLength() > 0);

        var alertId = list[0].GetProperty("id").GetGuid();
        var markRead = await _client.PatchAsync(
            $"/api/v1/farms/{DemoIds.DemoFarmId}/alerts/{alertId}/read",
            JsonContent.Create(new { }));
        markRead.EnsureSuccessStatusCode();
    }

    [Fact(DisplayName = "TC-NFR-017 Advisory disclaimer on AI outputs")]
    public async Task TC_NFR_017_PlanIncludesAdvisoryDisclaimer()
    {
        await AuthenticateDemoFarmerAsync();

        var plan = await _client.PostAsJsonAsync($"/api/v1/farms/{DemoIds.DemoFarmId}/plan", new { language = "en" });
        plan.EnsureSuccessStatusCode();
        var contentJson = (await plan.Content.ReadFromJsonAsync<JsonElement>())!.GetProperty("contentJson").GetString()!;

        Assert.True(
            contentJson.Contains("advisory", StringComparison.OrdinalIgnoreCase)
            || contentJson.Contains("reference", StringComparison.OrdinalIgnoreCase)
            || contentJson.Contains("not guaranteed", StringComparison.OrdinalIgnoreCase));
    }
}
