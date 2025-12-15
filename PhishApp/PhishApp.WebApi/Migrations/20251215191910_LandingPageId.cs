using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhishApp.WebApi.Migrations
{
    /// <inheritdoc />
    public partial class LandingPageId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsRedirectedToLandingPage",
                table: "CampaignGroupMemberEmailInfos",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "LandingId",
                table: "CampaignGroupMemberEmailInfos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RedirectedToLandingPageTime",
                table: "CampaignGroupMemberEmailInfos",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsRedirectedToLandingPage",
                table: "CampaignGroupMemberEmailInfos");

            migrationBuilder.DropColumn(
                name: "LandingId",
                table: "CampaignGroupMemberEmailInfos");

            migrationBuilder.DropColumn(
                name: "RedirectedToLandingPageTime",
                table: "CampaignGroupMemberEmailInfos");
        }
    }
}
