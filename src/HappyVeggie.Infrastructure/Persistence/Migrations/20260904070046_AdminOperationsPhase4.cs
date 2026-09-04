using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HappyVeggie.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AdminOperationsPhase4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsFlagged",
                table: "FarmPlans",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ReviewNote",
                table: "FarmPlans",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReviewStatus",
                table: "FarmPlans",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "none");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ReviewedAt",
                table: "FarmPlans",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "LlmUsageLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RequestType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Model = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    PromptTokens = table.Column<int>(type: "int", nullable: false),
                    CompletionTokens = table.Column<int>(type: "int", nullable: false),
                    EstimatedCostUsd = table.Column<decimal>(type: "decimal(18,8)", precision: 18, scale: 8, nullable: false),
                    FarmId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FarmerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LlmUsageLogs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FarmPlans_IsFlagged",
                table: "FarmPlans",
                column: "IsFlagged");

            migrationBuilder.CreateIndex(
                name: "IX_LlmUsageLogs_CreatedAt",
                table: "LlmUsageLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_LlmUsageLogs_RequestType",
                table: "LlmUsageLogs",
                column: "RequestType");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LlmUsageLogs");

            migrationBuilder.DropIndex(
                name: "IX_FarmPlans_IsFlagged",
                table: "FarmPlans");

            migrationBuilder.DropColumn(
                name: "IsFlagged",
                table: "FarmPlans");

            migrationBuilder.DropColumn(
                name: "ReviewNote",
                table: "FarmPlans");

            migrationBuilder.DropColumn(
                name: "ReviewStatus",
                table: "FarmPlans");

            migrationBuilder.DropColumn(
                name: "ReviewedAt",
                table: "FarmPlans");
        }
    }
}
