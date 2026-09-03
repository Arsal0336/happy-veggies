using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HappyVeggie.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SoilProfilePersistence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SoilProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FarmId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductionAreaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SoilType = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    SoilTypeProvenance = table.Column<int>(type: "int", nullable: true),
                    Texture = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    TextureProvenance = table.Column<int>(type: "int", nullable: true),
                    PhValue = table.Column<decimal>(type: "decimal(10,3)", precision: 10, scale: 3, nullable: true),
                    PhValueProvenance = table.Column<int>(type: "int", nullable: true),
                    OrganicMatterValue = table.Column<decimal>(type: "decimal(10,3)", precision: 10, scale: 3, nullable: true),
                    OrganicMatterProvenance = table.Column<int>(type: "int", nullable: true),
                    NitrogenValue = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    NitrogenProvenance = table.Column<int>(type: "int", nullable: true),
                    PhosphorusValue = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    PhosphorusProvenance = table.Column<int>(type: "int", nullable: true),
                    PotassiumValue = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    PotassiumProvenance = table.Column<int>(type: "int", nullable: true),
                    FarmerNotes = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SoilProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SoilProfiles_Farms_FarmId",
                        column: x => x.FarmId,
                        principalTable: "Farms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SoilProfiles_ProductionAreas_ProductionAreaId",
                        column: x => x.ProductionAreaId,
                        principalTable: "ProductionAreas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SoilProfiles_FarmId",
                table: "SoilProfiles",
                column: "FarmId");

            migrationBuilder.CreateIndex(
                name: "IX_SoilProfiles_FarmId_ProductionAreaId",
                table: "SoilProfiles",
                columns: new[] { "FarmId", "ProductionAreaId" },
                unique: true,
                filter: "[ProductionAreaId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_SoilProfiles_ProductionAreaId",
                table: "SoilProfiles",
                column: "ProductionAreaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SoilProfiles");
        }
    }
}
