using System.Security.Claims;
using System.Text;
using HappyVeggie.Api.Middleware;
using HappyVeggie.Api.Options;
using HappyVeggie.Api.RateLimiting;
using HappyVeggie.Application;
using HappyVeggie.Infrastructure;
using HappyVeggie.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, _, _) =>
    {
        document.Info.Title = "Happy Veggie API";
        document.Info.Description =
            "Demo farmer: +923001234567 OTP 1234. Demo admin: admin@happyveggie.pk / HappyVeggie!2026. Use HTTP Bearer JWT from those logins.";
        return Task.CompletedTask;
    });
});
builder.Services.AddControllers();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<HappyVeggie.Application.Common.Interfaces.ICurrentFarmerService, HappyVeggie.Api.Services.CurrentFarmerService>();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment.ContentRootPath);
builder.Services.AddHappyVeggieRateLimiting(builder.Configuration);

var jwtSection = builder.Configuration.GetSection(JwtOptions.SectionName);
builder.Services.Configure<JwtOptions>(jwtSection);
var jwtOptions = jwtSection.Get<JwtOptions>() ?? new JwtOptions();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };

        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var farmerIdValue = context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
                var sessionClaim = context.Principal?.FindFirstValue("sv");
                if (farmerIdValue is null || sessionClaim is null
                    || !int.TryParse(sessionClaim, out var tokenSessionVersion)
                    || !Guid.TryParse(farmerIdValue, out var farmerId))
                {
                    context.Fail("Invalid farmer session token.");
                    return;
                }

                var db = context.HttpContext.RequestServices.GetRequiredService<HappyVeggieDbContext>();
                var farmer = await db.Farmers
                    .AsNoTracking()
                    .FirstOrDefaultAsync(f => f.Id == farmerId, context.HttpContext.RequestAborted);

                if (farmer is null || farmer.SessionVersion != tokenSessionVersion)
                {
                    context.Fail("Farmer session has been revoked.");
                }
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

await DatabaseInitializer.InitializeAsync(app.Services);

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<ExceptionHandlingMiddleware>();

var swaggerEnabled = app.Environment.IsDevelopment()
    || string.Equals(app.Configuration["Swagger:Enabled"], "true", StringComparison.OrdinalIgnoreCase);
if (swaggerEnabled)
{
    app.MapOpenApi();
    app.MapScalarApiReference("/swagger", options =>
    {
        options.Title = "Happy Veggie API";
        options.WithDocumentDownloadType(DocumentDownloadType.Json);
    });
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapControllers();

app.Run();

public partial class Program;
