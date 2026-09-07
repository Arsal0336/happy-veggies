using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace HappyVeggie.Tests.Integration;

[Collection("Integration")]
public sealed class SrsFarmTests
{
    private readonly HttpClient _client;

    public SrsFarmTests(HappyVeggieWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<string> LoginFreshFarmerAsync()
    {
        var phone = $"+92300{Random.Shared.Next(1000000, 9999999)}";
        var token = await AuthTestHelper.LoginAsync(_client, phone);
        AuthTestHelper.UseBearer(_client, token);
        return token;
    }

    [Fact(DisplayName = "TC-FR-007 Create, view, update, soft-delete a farm")]
    public async Task TC_FR_007_FarmCrud_SoftDeleteHidesFarm()
    {
        await LoginFreshFarmerAsync();

        var create = await _client.PostAsJsonAsync("/api/v1/farms", new
        {
            name = "SRS Test Farm",
            lat = 33.6844,
            lng = 73.0479,
            regionCode = "ISB",
            regionLabel = "Islamabad",
            areaInputValue = 5,
            areaInputUnit = "acres"
        });
        create.EnsureSuccessStatusCode();
        var farm = await create.Content.ReadFromJsonAsync<JsonElement>();
        var farmId = farm.GetProperty("id").GetGuid();

        var get = await _client.GetAsync($"/api/v1/farms/{farmId}");
        get.EnsureSuccessStatusCode();

        var patch = await _client.PatchAsJsonAsync($"/api/v1/farms/{farmId}", new
        {
            name = "Updated SRS Farm"
        });
        patch.EnsureSuccessStatusCode();
        var updated = await patch.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Updated SRS Farm", updated.GetProperty("name").GetString());

        var delete = await _client.DeleteAsync($"/api/v1/farms/{farmId}");
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);

        var missing = await _client.GetAsync($"/api/v1/farms/{farmId}");
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
    }

    [Fact(DisplayName = "TC-FR-009 Area in kanal stored canonically in acres")]
    public async Task TC_FR_009_KanalInput_StoresQuarterAcreForTwoKanal()
    {
        await LoginFreshFarmerAsync();

        var create = await _client.PostAsJsonAsync("/api/v1/farms", new
        {
            name = "Kanal Farm",
            lat = 33.6844,
            lng = 73.0479,
            regionCode = "ISB",
            regionLabel = "Islamabad",
            areaInputValue = 2,
            areaInputUnit = "kanal"
        });
        create.EnsureSuccessStatusCode();
        var farm = await create.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(0.25m, farm.GetProperty("areaAcres").GetDecimal());
        Assert.Equal(2, farm.GetProperty("areaInputValue").GetDecimal());
        Assert.Equal("kanal", farm.GetProperty("areaInputUnit").GetString());
    }

    [Fact(DisplayName = "TC-FR-010 Region suggested from location")]
    public async Task TC_FR_010_RegionSuggest_ReturnsIslamabadForDemoCoords()
    {
        var response = await _client.GetAsync("/api/v1/system/region-suggest?lat=33.6844&lng=73.0479");
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("ISB", body.GetProperty("regionCode").GetString());
        Assert.Equal("Islamabad", body.GetProperty("regionLabel").GetString());
    }

    [Fact(DisplayName = "TC-FR-013 Default Open Field production area on create")]
    public async Task TC_FR_013_CreateFarm_AddsDefaultOpenFieldArea()
    {
        await LoginFreshFarmerAsync();

        var create = await _client.PostAsJsonAsync("/api/v1/farms", new
        {
            name = "Default Area Farm",
            lat = 33.6844,
            lng = 73.0479,
            regionCode = "ISB",
            regionLabel = "Islamabad",
            areaInputValue = 3,
            areaInputUnit = "acres"
        });
        create.EnsureSuccessStatusCode();
        var farmId = (await create.Content.ReadFromJsonAsync<JsonElement>())!.GetProperty("id").GetGuid();

        var areas = await _client.GetAsync($"/api/v1/farms/{farmId}/production-areas");
        areas.EnsureSuccessStatusCode();
        var areaList = await areas.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(areaList.GetArrayLength() >= 1);
        Assert.Equal("open_field", areaList[0].GetProperty("typeCode").GetString());
    }

    [Fact(DisplayName = "TC-FR-018 Farm declares water sources")]
    public async Task TC_FR_018_WaterSources_PersistForFarm()
    {
        await LoginFreshFarmerAsync();

        var create = await _client.PostAsJsonAsync("/api/v1/farms", new
        {
            name = "Water Farm",
            lat = 33.6844,
            lng = 73.0479,
            regionCode = "ISB",
            regionLabel = "Islamabad",
            areaInputValue = 2,
            areaInputUnit = "acres"
        });
        create.EnsureSuccessStatusCode();
        var farmId = (await create.Content.ReadFromJsonAsync<JsonElement>())!.GetProperty("id").GetGuid();

        var addWell = await _client.PostAsJsonAsync($"/api/v1/farms/{farmId}/water-sources", new
        {
            type = "tube_well",
            availabilityValue = 1,
            availabilityUnit = "source",
            availabilityProvenance = "farmer_provided",
            reliabilityValue = 0.9,
            reliabilityProvenance = "farmer_provided",
            irrigationMethod = "drip",
            irrigationMethodProvenance = "farmer_provided"
        });
        addWell.EnsureSuccessStatusCode();

        var addCanal = await _client.PostAsJsonAsync($"/api/v1/farms/{farmId}/water-sources", new
        {
            type = "canal",
            availabilityValue = 1,
            availabilityUnit = "source",
            availabilityProvenance = "farmer_provided",
            reliabilityValue = 0.7,
            reliabilityProvenance = "farmer_provided",
            irrigationMethod = "furrow",
            irrigationMethodProvenance = "farmer_provided"
        });
        addCanal.EnsureSuccessStatusCode();

        var list = await _client.GetAsync($"/api/v1/farms/{farmId}/water-sources");
        list.EnsureSuccessStatusCode();
        var sources = await list.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(sources.GetArrayLength() >= 2);
    }
}
