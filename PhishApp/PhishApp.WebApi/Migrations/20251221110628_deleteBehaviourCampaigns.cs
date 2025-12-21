using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhishApp.WebApi.Migrations
{
    /// <inheritdoc />
    public partial class deleteBehaviourCampaigns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "SendingProfiles",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Recipients",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "RecipientGroups",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AddForeignKey(
                name: "FK_Campaigns_LandingPages_LandingPageId",
                table: "Campaigns",
                column: "LandingPageId",
                principalTable: "LandingPages",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Campaigns_SendingProfiles_SendingProfileId",
                table: "Campaigns",
                column: "SendingProfileId",
                principalTable: "SendingProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Campaigns_Templates_TemplateId",
                table: "Campaigns",
                column: "TemplateId",
                principalTable: "Templates",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
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

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "SendingProfiles",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETDATE()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Recipients",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETDATE()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "RecipientGroups",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETDATE()");

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
    }
}
