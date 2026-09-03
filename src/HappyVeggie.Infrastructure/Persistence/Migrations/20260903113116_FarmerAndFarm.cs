using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HappyVeggie.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FarmerAndFarm : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Farmers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: true),
                    Language = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: false, defaultValue: "en"),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Farmers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Farms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FarmerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    Lat = table.Column<decimal>(type: "decimal(9,6)", precision: 9, scale: 6, nullable: false),
                    Lng = table.Column<decimal>(type: "decimal(9,6)", precision: 9, scale: 6, nullable: false),
                    RegionCode = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    RegionLabel = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    AreaAcres = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    AreaInputValue = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    AreaInputUnit = table.Column<string>(type: "nvarchar(24)", maxLength: 24, nullable: false),
                    PreferredCropId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    PreferredCropFreeText = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    IsNewFarmSetup = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    SoilType = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    WaterAccess = table.Column<bool>(type: "bit", nullable: true),
                    WaterSource = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    BudgetAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    BudgetCurrency = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: true),
                    LetAiChooseCrop = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Farms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Farms_Farmers_FarmerId",
                        column: x => x.FarmerId,
                        principalTable: "Farmers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Farmers_Phone",
                table: "Farmers",
                column: "Phone",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Farms_FarmerId",
                table: "Farms",
                column: "FarmerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Farms");

            migrationBuilder.DropTable(
                name: "Farmers");
        }
    }
}
