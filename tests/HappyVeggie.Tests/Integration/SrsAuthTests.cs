using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace HappyVeggie.Tests.Integration;

[Collection("Integration")]
public sealed class SrsAuthTests
{
    private readonly HttpClient _client;

    public SrsAuthTests(HappyVeggieWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact(DisplayName = "TC-FR-001 Farmer login via phone + OTP")]
    public async Task TC_FR_001_LoginWithValidOtp_Succeeds()
    {
        var token = await AuthTestHelper.LoginAsync(_client, "+923001234567");
        Assert.False(string.IsNullOrWhiteSpace(token));
    }

    [Fact(DisplayName = "TC-FR-002 Login rejected with invalid OTP")]
    public async Task TC_FR_002_InvalidOtp_ReturnsUnauthorized()
    {
        var request = await _client.PostAsJsonAsync("/api/v1/auth/otp/request", new
        {
            phone = "+923009999001",
            language = "en"
        });
        request.EnsureSuccessStatusCode();
        var requestBody = await request.Content.ReadFromJsonAsync<JsonElement>();
        var requestId = requestBody.GetProperty("requestId").GetString();

        var verify = await _client.PostAsJsonAsync("/api/v1/auth/otp/verify", new
        {
            requestId,
            phone = "+923009999001",
            code = "0000"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, verify.StatusCode);
        Assert.Equal("UNAUTHORIZED", await ApiErrorReader.ReadCodeAsync(verify));
    }

    [Fact(DisplayName = "TC-FR-003 Owner-scoped data access enforced")]
    public async Task TC_FR_003_OtherFarmersFarm_ReturnsForbidden()
    {
        var tokenA = await AuthTestHelper.LoginAsync(_client, "+923001234567");
        AuthTestHelper.UseBearer(_client, tokenA);

        var tokenB = await AuthTestHelper.LoginAsync(_client, "+923009999002");
        AuthTestHelper.UseBearer(_client, tokenB);

        var response = await _client.GetAsync($"/api/v1/farms/{DemoIds.DemoFarmId}");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact(DisplayName = "TC-FR-004 Unified entry routes new vs returning farmer")]
    public async Task TC_FR_004_NewFarmerFlag_ReflectsRegistrationState()
    {
        var phone = $"+92300{Random.Shared.Next(1000000, 9999999)}";
        var request = await _client.PostAsJsonAsync("/api/v1/auth/otp/request", new { phone, language = "en" });
        request.EnsureSuccessStatusCode();
        var requestBody = await request.Content.ReadFromJsonAsync<JsonElement>();
        var requestId = requestBody.GetProperty("requestId").GetString();

        var verify = await _client.PostAsJsonAsync("/api/v1/auth/otp/verify", new
        {
            requestId,
            phone,
            code = "1234"
        });
        verify.EnsureSuccessStatusCode();
        var body = await verify.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(body.GetProperty("isNew").GetBoolean());

        var returning = await AuthTestHelper.LoginAsync(_client, phone);
        Assert.False(string.IsNullOrWhiteSpace(returning));
    }

    [Fact(DisplayName = "TC-FR-005 First-time profile capture (name + language)")]
    public async Task TC_FR_005_ProfileCapture_PersistsNameAndLanguage()
    {
        var phone = $"+92300{Random.Shared.Next(1000000, 9999999)}";
        var token = await AuthTestHelper.LoginAsync(_client, phone);
        AuthTestHelper.UseBearer(_client, token);

        var update = await _client.PostAsJsonAsync("/api/v1/farmers/me/profile", new
        {
            name = "Sana Khan",
            language = "ur"
        });
        update.EnsureSuccessStatusCode();
        var profile = await update.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Sana Khan", profile.GetProperty("name").GetString());
        Assert.Equal("ur", profile.GetProperty("language").GetString());
    }

    [Fact(DisplayName = "TC-FR-006 Session refresh and revocation")]
    public async Task TC_FR_006_RefreshAndLogout_InvalidatesOldToken()
    {
        var phone = $"+92300{Random.Shared.Next(1000000, 9999999)}";
        var token = await AuthTestHelper.LoginAsync(_client, phone);
        AuthTestHelper.UseBearer(_client, token);

        var refresh = await _client.PostAsync("/api/v1/auth/refresh", content: null);
        refresh.EnsureSuccessStatusCode();
        var refreshed = await refresh.Content.ReadFromJsonAsync<JsonElement>();
        var newToken = refreshed.GetProperty("sessionToken").GetString()!;
        Assert.NotEqual(token, newToken);

        AuthTestHelper.UseBearer(_client, newToken);
        var logout = await _client.PostAsync("/api/v1/auth/logout", content: null);
        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);

        AuthTestHelper.UseBearer(_client, newToken);
        var blocked = await _client.GetAsync("/api/v1/farms");
        Assert.Equal(HttpStatusCode.Unauthorized, blocked.StatusCode);
    }
}
