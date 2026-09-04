using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HappyVeggie.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FeatureFlagsAndAuthPlatform : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FeatureFlags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Enabled = table.Column<bool>(type: "bit", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedByAdminId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeatureFlags", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "FeatureFlags",
                columns: new[] { "Id", "Description", "Enabled", "Key", "UpdatedAt", "UpdatedByAdminId" },
                values: new object[,]
                {
                    { new Guid("a1000001-0000-4000-8000-000000000001"), "Use mock OTP provider instead of live SMS", true, "otp.use_mock", new DateTimeOffset(new DateTime(2026, 9, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null },
                    { new Guid("a1000001-0000-4000-8000-000000000002"), "Enable live weather enrichment for digital twin", false, "weather.enrichment", new DateTimeOffset(new DateTime(2026, 9, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null },
                    { new Guid("a1000001-0000-4000-8000-000000000003"), "Enable live soil enrichment for digital twin", false, "soil.enrichment", new DateTimeOffset(new DateTime(2026, 9, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null },
                    { new Guid("a1000001-0000-4000-8000-000000000004"), "Use live LLM provider instead of stub", false, "llm.live", new DateTimeOffset(new DateTime(2026, 9, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_FeatureFlags_Key",
                table: "FeatureFlags",
                column: "Key",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FeatureFlags");
        }
    }
}
