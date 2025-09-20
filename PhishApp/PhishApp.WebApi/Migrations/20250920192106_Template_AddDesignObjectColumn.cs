using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhishApp.WebApi.Migrations
{
    /// <inheritdoc />
    public partial class Template_AddDesignObjectColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DesignObject",
                table: "Templates",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DesignObject",
                table: "Templates");
        }
    }
}
