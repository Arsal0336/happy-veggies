using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HappyVeggie.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase5IntelligenceAlertsAndCropCycle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Delta",
                table: "CropCycles",
                type: "decimal(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "EndedAt",
                table: "CropCycles",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Alerts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FarmId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Severity = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Body = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    SourceSignal = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Alerts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Alerts_Farms_FarmId",
                        column: x => x.FarmId,
                        principalTable: "Farms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_FarmId",
                table: "Alerts",
                column: "FarmId");

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_FarmId_IsRead",
                table: "Alerts",
                columns: new[] { "FarmId", "IsRead" });

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_FarmId_SourceSignal",
                table: "Alerts",
                columns: new[] { "FarmId", "SourceSignal" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Alerts");

            migrationBuilder.DropColumn(
                name: "Delta",
                table: "CropCycles");

            migrationBuilder.DropColumn(
                name: "EndedAt",
                table: "CropCycles");
        }
    }
}
