using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhishApp.WebApi.Migrations
{
    /// <inheritdoc />
    public partial class CampaignGroupMemberEmailInfoEntity_RecipientMemberId_nullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CampaignGroupMemberEmailInfos_RecipientGroupMembers_RecipientMemberId",
                table: "CampaignGroupMemberEmailInfos");

            migrationBuilder.AlterColumn<int>(
                name: "RecipientMemberId",
                table: "CampaignGroupMemberEmailInfos",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_CampaignGroupMemberEmailInfos_RecipientGroupMembers_RecipientMemberId",
                table: "CampaignGroupMemberEmailInfos",
                column: "RecipientMemberId",
                principalTable: "RecipientGroupMembers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CampaignGroupMemberEmailInfos_RecipientGroupMembers_RecipientMemberId",
                table: "CampaignGroupMemberEmailInfos");

            migrationBuilder.AlterColumn<int>(
                name: "RecipientMemberId",
                table: "CampaignGroupMemberEmailInfos",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CampaignGroupMemberEmailInfos_RecipientGroupMembers_RecipientMemberId",
                table: "CampaignGroupMemberEmailInfos",
                column: "RecipientMemberId",
                principalTable: "RecipientGroupMembers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
