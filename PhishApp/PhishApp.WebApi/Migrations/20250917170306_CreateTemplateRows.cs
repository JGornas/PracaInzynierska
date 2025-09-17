using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhishApp.WebApi.Migrations
{
    /// <inheritdoc />
    public partial class CreateTemplateRows : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
CREATE VIEW TemplateRows AS
SELECT
      [Id],
      [Name],
      [Subject],
      [Content]
FROM [PhishAppDB].[dbo].[Templates];
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DROP VIEW IF EXISTS TemplateRows;
");
        }
    }
}
