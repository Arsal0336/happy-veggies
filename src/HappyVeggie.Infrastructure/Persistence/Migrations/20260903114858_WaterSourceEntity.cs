using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HappyVeggie.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class WaterSourceEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WaterSources",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FarmId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    AvailabilityValue = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    AvailabilityUnit = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: true),
                    AvailabilityProvenance = table.Column<int>(type: "int", nullable: true),
                    SeasonalAvailability = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    SeasonalAvailabilityProvenance = table.Column<int>(type: "int", nullable: true),
                    CapacityEstimateValue = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    CapacityEstimateUnit = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: true),
                    CapacityEstimateProvenance = table.Column<int>(type: "int", nullable: true),
                    ReliabilityValue = table.Column<decimal>(type: "decimal(10,4)", precision: 10, scale: 4, nullable: true),
                    ReliabilityProvenance = table.Column<int>(type: "int", nullable: true),
                    IrrigationMethod = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    IrrigationMethodProvenance = table.Column<int>(type: "int", nullable: true),
                    ServedCropZoneIdsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WaterSources", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WaterSources_Farms_FarmId",
                        column: x => x.FarmId,
                        principalTable: "Farms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WaterSources_FarmId",
                table: "WaterSources",
                column: "FarmId");

            migrationBuilder.CreateIndex(
                name: "IX_WaterSources_Type",
                table: "WaterSources",
                column: "Type");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WaterSources");
        }
    }
}
