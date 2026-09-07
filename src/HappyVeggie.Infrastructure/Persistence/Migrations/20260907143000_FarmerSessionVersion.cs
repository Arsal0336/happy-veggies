using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HappyVeggie.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class FarmerSessionVersion : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "SessionVersion",
            table: "Farmers",
            type: "int",
            nullable: false,
            defaultValue: 0);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "SessionVersion",
            table: "Farmers");
    }
}
