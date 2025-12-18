using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhishApp.WebApi.Migrations
{
    /// <inheritdoc />
    public partial class FormSubmitId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "FormSubmitId",
                table: "CampaignGroupMemberEmailInfos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FormSubmittedTime",
                table: "CampaignGroupMemberEmailInfos",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsFormSubmitted",
                table: "CampaignGroupMemberEmailInfos",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FormSubmitId",
                table: "CampaignGroupMemberEmailInfos");

            migrationBuilder.DropColumn(
                name: "FormSubmittedTime",
                table: "CampaignGroupMemberEmailInfos");

            migrationBuilder.DropColumn(
                name: "IsFormSubmitted",
                table: "CampaignGroupMemberEmailInfos");
        }
    }
}
