using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhishApp.WebApi.Migrations
{
    /// <inheritdoc />
    public partial class campaignRows : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
CREATE OR ALTER VIEW CampaignRows
AS
SELECT 
    c.Id,
    c.Name,
    c.Description
FROM Campaigns AS c;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DROP VIEW IF EXISTS CampaignRows;
");
        }
    }
}
