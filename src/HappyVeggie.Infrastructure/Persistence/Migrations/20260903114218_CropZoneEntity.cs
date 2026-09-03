using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HappyVeggie.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CropZoneEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CropZones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FarmId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductionAreaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Label = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    AreaInputValue = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    AreaInputUnit = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    AreaCanonicalValue = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    CropId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    CropFreetext = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    SeedVarietyId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    PlantingDate = table.Column<DateOnly>(type: "date", nullable: true),
                    GrowthStage = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    ExpectedYieldValue = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    ExpectedYieldUnit = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    ExpectedYieldProvenance = table.Column<int>(type: "int", nullable: true),
                    IsExperimental = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CropZones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CropZones_Farms_FarmId",
                        column: x => x.FarmId,
                        principalTable: "Farms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CropZones_ProductionAreas_ProductionAreaId",
                        column: x => x.ProductionAreaId,
                        principalTable: "ProductionAreas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CropZones_FarmId",
                table: "CropZones",
                column: "FarmId");

            migrationBuilder.CreateIndex(
                name: "IX_CropZones_FarmId_ProductionAreaId",
                table: "CropZones",
                columns: new[] { "FarmId", "ProductionAreaId" });

            migrationBuilder.CreateIndex(
                name: "IX_CropZones_ProductionAreaId",
                table: "CropZones",
                column: "ProductionAreaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CropZones");
        }
    }
}
