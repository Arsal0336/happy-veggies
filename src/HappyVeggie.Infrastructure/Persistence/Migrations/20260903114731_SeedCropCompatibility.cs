using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HappyVeggie.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedCropCompatibility : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "CropCompatibility",
                columns: new[] { "Id", "CropAId", "CropBId", "Enabled", "Reason", "Relation", "Scope" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), "tomato", "onion", true, "Commonly paired to reduce pests (demo seed).", 0, 0 },
                    { new Guid("11111111-1111-1111-1111-111111111112"), "onion", "tomato", true, "Commonly paired to reduce pests (demo seed).", 0, 0 },
                    { new Guid("11111111-1111-1111-1111-111111111113"), "tomato", "potato", true, "Both can share similar pests/diseases (demo seed).", 1, 0 },
                    { new Guid("11111111-1111-1111-1111-111111111114"), "potato", "tomato", true, "Both can share similar pests/diseases (demo seed).", 1, 0 },
                    { new Guid("11111111-1111-1111-1111-111111111115"), "cucumber", "capsicum", true, "Compatible spacing/companion growth pattern (demo seed).", 0, 0 },
                    { new Guid("11111111-1111-1111-1111-111111111116"), "capsicum", "cucumber", true, "Compatible spacing/companion growth pattern (demo seed).", 0, 0 },
                    { new Guid("11111111-1111-1111-1111-111111111117"), "spinach", "onion", true, "Neutral compatibility for on-farm adjacency (demo seed).", 2, 0 },
                    { new Guid("11111111-1111-1111-1111-111111111118"), "onion", "spinach", true, "Neutral compatibility for on-farm adjacency (demo seed).", 2, 0 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "CropCompatibility",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "CropCompatibility",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111112"));

            migrationBuilder.DeleteData(
                table: "CropCompatibility",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111113"));

            migrationBuilder.DeleteData(
                table: "CropCompatibility",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111114"));

            migrationBuilder.DeleteData(
                table: "CropCompatibility",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111115"));

            migrationBuilder.DeleteData(
                table: "CropCompatibility",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111116"));

            migrationBuilder.DeleteData(
                table: "CropCompatibility",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111117"));

            migrationBuilder.DeleteData(
                table: "CropCompatibility",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111118"));
        }
    }
}
