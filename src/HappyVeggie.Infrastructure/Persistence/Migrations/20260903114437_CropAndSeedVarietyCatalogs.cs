using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HappyVeggie.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CropAndSeedVarietyCatalogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Crops",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    NameUr = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    IconUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Enabled = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Crops", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SeedVarieties",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    CropId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    NameUr = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    VarietyType = table.Column<int>(type: "int", nullable: false),
                    Enabled = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    MaturityDays = table.Column<int>(type: "int", nullable: true),
                    RiskBand = table.Column<int>(type: "int", nullable: true),
                    SoilNotes = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: true),
                    WaterNotes = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: true),
                    DiseaseResistanceNotes = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SeedVarieties", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SeedVarieties_Crops_CropId",
                        column: x => x.CropId,
                        principalTable: "Crops",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Crops",
                columns: new[] { "Id", "Enabled", "IconUrl", "NameEn", "NameUr" },
                values: new object[,]
                {
                    { "cabbage", true, null, "Cabbage", "بند گوبھی" },
                    { "capsicum", true, null, "Capsicum", "شملہ مرچ" },
                    { "carrot", true, null, "Carrot", "گاجر" },
                    { "chili", true, null, "Chili", "مرچ" },
                    { "cucumber", true, null, "Cucumber", "کھیر ی" },
                    { "eggplant", true, null, "Eggplant", "بینگن" },
                    { "lettuce", true, null, "Lettuce", "لیٹش" },
                    { "okra", true, null, "Okra", "بھِنڈی" },
                    { "onion", true, null, "Onion", "پیااز" },
                    { "potato", true, null, "Potato", "آلو" },
                    { "spinach", true, null, "Spinach", "پالک" },
                    { "tomato", true, null, "Tomato", "ٹماٹر" }
                });

            migrationBuilder.InsertData(
                table: "SeedVarieties",
                columns: new[] { "Id", "CropId", "DiseaseResistanceNotes", "Enabled", "MaturityDays", "NameEn", "NameUr", "RiskBand", "SoilNotes", "VarietyType", "WaterNotes" },
                values: new object[,]
                {
                    { "cabbage_local_1", "cabbage", null, true, 75, "Cabbage Local Variety I", "مقامی بند گوبھی آئی", 1, null, 2, null },
                    { "capsicum_hybrid_1", "capsicum", null, true, 80, "Capsicum Hybrid D", "ہائبرڈ شملہ مرچ ڈی", 1, null, 0, null },
                    { "carrot_local_1", "carrot", null, true, 70, "Carrot Local Variety J", "مقامی گاجر جے", 1, null, 2, null },
                    { "chili_hybrid_1", "chili", null, true, 70, "Chili Hybrid E", "ہائبرڈ مرچ ای", 1, null, 0, null },
                    { "cucumber_hybrid_1", "cucumber", null, true, 50, "Cucumber Hybrid C", "ہائبرڈ کھیر ی سی", 1, null, 0, null },
                    { "eggplant_openpoll_1", "eggplant", null, true, 95, "Eggplant Open Pollinated F", "اوپن پولینیٹڈ بینگن ایف", 1, null, 1, null },
                    { "lettuce_local_1", "lettuce", null, true, 45, "Lettuce Local Variety K", "مقامی لیٹش کے", 1, null, 2, null },
                    { "okra_local_1", "okra", null, true, 55, "Okra Local Variety G", "مقامی بھِنڈی قسم جی", 1, null, 2, null },
                    { "onion_local_1", "onion", null, true, 95, "Local Onion Variety A", "مقامی پیاز قسم اے", 1, null, 2, null },
                    { "potato_local_1", "potato", null, true, 100, "Local Potato Variety X", "مقامی آلو قسم ایکس", 1, null, 2, null },
                    { "spinach_openpoll_1", "spinach", null, true, 40, "Spinach Open Pollinated H", "اوپن پولینیٹڈ پالک ایچ", 1, null, 1, null },
                    { "tomato_hybrid_1", "tomato", "Basic fungal resistance (demo)", true, 75, "Tomato Hybrid A", "ہائبرڈ ٹماٹر اے", 1, "General vegetable-friendly soil", 0, "Moderate irrigation; avoid waterlogging" },
                    { "tomato_openpoll_1", "tomato", "Moderate disease tolerance (demo)", true, 90, "Tomato Open Pollinated B", "اوپن پولینیٹڈ ٹماٹر بی", 1, "Works across common farm soils", 1, "Steady watering schedule" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Crops_Enabled",
                table: "Crops",
                column: "Enabled");

            migrationBuilder.CreateIndex(
                name: "IX_SeedVarieties_CropId",
                table: "SeedVarieties",
                column: "CropId");

            migrationBuilder.CreateIndex(
                name: "IX_SeedVarieties_Enabled",
                table: "SeedVarieties",
                column: "Enabled");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SeedVarieties");

            migrationBuilder.DropTable(
                name: "Crops");
        }
    }
}
