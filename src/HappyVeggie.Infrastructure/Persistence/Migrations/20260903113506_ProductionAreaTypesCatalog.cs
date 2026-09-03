using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HappyVeggie.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ProductionAreaTypesCatalog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProductionAreaTypes",
                columns: table => new
                {
                    Code = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    NameUr = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Enabled = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductionAreaTypes", x => x.Code);
                });

            migrationBuilder.InsertData(
                table: "ProductionAreaTypes",
                columns: new[] { "Code", "Category", "Enabled", "NameEn", "NameUr" },
                values: new object[,]
                {
                    { "experimental", 2, true, "Experimental", "تجربی" },
                    { "greenhouse", 1, true, "Greenhouse", "گرین ہاؤس" },
                    { "open_field", 0, true, "Open Field", "کھلا میدان" },
                    { "other_protected", 1, true, "Other Protected", "دیگر محفوظ ماحول" },
                    { "shed", 1, true, "Shed", "شیڈ" },
                    { "tunnel_polyhouse", 1, true, "Tunnel / Polyhouse", "ٹنل / پولی ہاؤس" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductionAreaTypes_Category",
                table: "ProductionAreaTypes",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionAreaTypes_Enabled",
                table: "ProductionAreaTypes",
                column: "Enabled");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductionAreaTypes");
        }
    }
}
