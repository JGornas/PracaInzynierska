using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhishApp.WebApi.Migrations
{
    /// <inheritdoc />
    public partial class CampaignsRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LandingPageId",
                table: "Campaigns",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SendTime",
                table: "Campaigns",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SendingProfileId",
                table: "Campaigns",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TemplateId",
                table: "Campaigns",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_LandingPageId",
                table: "Campaigns",
                column: "LandingPageId");

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_SendingProfileId",
                table: "Campaigns",
                column: "SendingProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_TemplateId",
                table: "Campaigns",
                column: "TemplateId");

            migrationBuilder.AddForeignKey(
                name: "FK_Campaigns_LandingPages_LandingPageId",
                table: "Campaigns",
                column: "LandingPageId",
                principalTable: "LandingPages",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Campaigns_SendingProfiles_SendingProfileId",
                table: "Campaigns",
                column: "SendingProfileId",
                principalTable: "SendingProfiles",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Campaigns_Templates_TemplateId",
                table: "Campaigns",
                column: "TemplateId",
                principalTable: "Templates",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Campaigns_LandingPages_LandingPageId",
                table: "Campaigns");

            migrationBuilder.DropForeignKey(
                name: "FK_Campaigns_SendingProfiles_SendingProfileId",
                table: "Campaigns");

            migrationBuilder.DropForeignKey(
                name: "FK_Campaigns_Templates_TemplateId",
                table: "Campaigns");

            migrationBuilder.DropIndex(
                name: "IX_Campaigns_LandingPageId",
                table: "Campaigns");

            migrationBuilder.DropIndex(
                name: "IX_Campaigns_SendingProfileId",
                table: "Campaigns");

            migrationBuilder.DropIndex(
                name: "IX_Campaigns_TemplateId",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "LandingPageId",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "SendTime",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "SendingProfileId",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "TemplateId",
                table: "Campaigns");
        }
    }
}
