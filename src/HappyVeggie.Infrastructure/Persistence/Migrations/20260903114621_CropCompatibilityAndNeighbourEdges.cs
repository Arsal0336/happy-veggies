using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HappyVeggie.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CropCompatibilityAndNeighbourEdges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CropCompatibility",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CropAId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    CropBId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Relation = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Scope = table.Column<int>(type: "int", nullable: false),
                    Enabled = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CropCompatibility", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FieldNeighbourEdges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FarmId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CropZoneAId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CropZoneBId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AdjacencyType = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Source = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Enabled = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FieldNeighbourEdges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FieldNeighbourEdges_CropZones_CropZoneAId",
                        column: x => x.CropZoneAId,
                        principalTable: "CropZones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FieldNeighbourEdges_CropZones_CropZoneBId",
                        column: x => x.CropZoneBId,
                        principalTable: "CropZones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FieldNeighbourEdges_Farms_FarmId",
                        column: x => x.FarmId,
                        principalTable: "Farms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CropCompatibility_CropAId",
                table: "CropCompatibility",
                column: "CropAId");

            migrationBuilder.CreateIndex(
                name: "IX_CropCompatibility_CropAId_CropBId_Scope",
                table: "CropCompatibility",
                columns: new[] { "CropAId", "CropBId", "Scope" });

            migrationBuilder.CreateIndex(
                name: "IX_CropCompatibility_CropBId",
                table: "CropCompatibility",
                column: "CropBId");

            migrationBuilder.CreateIndex(
                name: "IX_FieldNeighbourEdges_CropZoneAId",
                table: "FieldNeighbourEdges",
                column: "CropZoneAId");

            migrationBuilder.CreateIndex(
                name: "IX_FieldNeighbourEdges_CropZoneBId",
                table: "FieldNeighbourEdges",
                column: "CropZoneBId");

            migrationBuilder.CreateIndex(
                name: "IX_FieldNeighbourEdges_FarmId",
                table: "FieldNeighbourEdges",
                column: "FarmId");

            migrationBuilder.CreateIndex(
                name: "IX_FieldNeighbourEdges_FarmId_CropZoneAId_CropZoneBId",
                table: "FieldNeighbourEdges",
                columns: new[] { "FarmId", "CropZoneAId", "CropZoneBId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CropCompatibility");

            migrationBuilder.DropTable(
                name: "FieldNeighbourEdges");
        }
    }
}
