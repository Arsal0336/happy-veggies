using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HappyVeggie.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ProductionAreaEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProductionAreas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FarmId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TypeCode = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    AreaInputValue = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    AreaInputUnit = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    AreaCanonicalValue = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    TemperatureC = table.Column<decimal>(type: "decimal(10,3)", precision: 10, scale: 3, nullable: true),
                    TemperatureProvenance = table.Column<int>(type: "int", nullable: true),
                    HumidityPercent = table.Column<decimal>(type: "decimal(10,3)", precision: 10, scale: 3, nullable: true),
                    HumidityProvenance = table.Column<int>(type: "int", nullable: true),
                    Ventilation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VentilationProvenance = table.Column<int>(type: "int", nullable: true),
                    GrowingMedium = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GrowingMediumProvenance = table.Column<int>(type: "int", nullable: true),
                    StructureType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StructureTypeProvenance = table.Column<int>(type: "int", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductionAreas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductionAreas_Farms_FarmId",
                        column: x => x.FarmId,
                        principalTable: "Farms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductionAreas_ProductionAreaTypes_TypeCode",
                        column: x => x.TypeCode,
                        principalTable: "ProductionAreaTypes",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductionAreas_FarmId",
                table: "ProductionAreas",
                column: "FarmId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionAreas_FarmId_TypeCode",
                table: "ProductionAreas",
                columns: new[] { "FarmId", "TypeCode" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductionAreas_TypeCode",
                table: "ProductionAreas",
                column: "TypeCode");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductionAreas");
        }
    }
}
