using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace HappyVeggie.Tests.Integration;

internal static class AuthTestHelper
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static async Task<string> LoginAsync(HttpClient client, string phone, string code = "1234")
    {
        var request = await client.PostAsJsonAsync("/api/v1/auth/otp/request", new { phone, language = "en" });
        request.EnsureSuccessStatusCode();
        var requestBody = await request.Content.ReadFromJsonAsync<OtpRequestResponse>(JsonOptions)
            ?? throw new InvalidOperationException("OTP request returned no body.");

        var verify = await client.PostAsJsonAsync("/api/v1/auth/otp/verify", new
        {
            requestId = requestBody.RequestId,
            phone,
            code
        });
        verify.EnsureSuccessStatusCode();
        var verifyBody = await verify.Content.ReadFromJsonAsync<OtpVerifyResponse>(JsonOptions)
            ?? throw new InvalidOperationException("OTP verify returned no body.");

        return verifyBody.SessionToken;
    }

    public static void UseBearer(HttpClient client, string token)
    {
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    public static void ClearAuth(HttpClient client)
    {
        client.DefaultRequestHeaders.Authorization = null;
    }

    private sealed record OtpRequestResponse(string RequestId, string Mode);
    private sealed record OtpVerifyResponse(string SessionToken, OtpFarmerDto Farmer, bool IsNew);
    private sealed record OtpFarmerDto(Guid Id, string Phone, string? Name, string Language);
}

internal static class ApiErrorReader
{
    public static async Task<string?> ReadCodeAsync(HttpResponseMessage response)
    {
        try
        {
            using var doc = await response.Content.ReadFromJsonAsync<JsonDocument>();
            return doc?.RootElement.TryGetProperty("code", out var code) == true
                ? code.GetString()
                : null;
        }
        catch
        {
            return null;
        }
    }
}

internal static class DemoIds
{
    public static readonly Guid DemoFarmId = Guid.Parse("aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0003");
}
