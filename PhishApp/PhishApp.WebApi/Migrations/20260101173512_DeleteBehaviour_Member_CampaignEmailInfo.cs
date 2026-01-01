using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhishApp.WebApi.Migrations
{
    /// <inheritdoc />
    public partial class DeleteBehaviour_Member_CampaignEmailInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CampaignGroupMemberEmailInfos_RecipientGroupMembers_RecipientMemberId",
                table: "CampaignGroupMemberEmailInfos");

            migrationBuilder.AddColumn<int>(
                name: "CampaignEntityId",
                table: "CampaignGroupMemberEmailInfos",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RecipientGroupMemberEntityId",
                table: "CampaignGroupMemberEmailInfos",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CampaignGroupMemberEmailInfos_CampaignEntityId",
                table: "CampaignGroupMemberEmailInfos",
                column: "CampaignEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_CampaignGroupMemberEmailInfos_RecipientGroupMemberEntityId",
                table: "CampaignGroupMemberEmailInfos",
                column: "RecipientGroupMemberEntityId");

            migrationBuilder.AddForeignKey(
                name: "FK_CampaignGroupMemberEmailInfos_Campaigns_CampaignEntityId",
                table: "CampaignGroupMemberEmailInfos",
                column: "CampaignEntityId",
                principalTable: "Campaigns",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CampaignGroupMemberEmailInfos_RecipientGroupMembers_RecipientGroupMemberEntityId",
                table: "CampaignGroupMemberEmailInfos",
                column: "RecipientGroupMemberEntityId",
                principalTable: "RecipientGroupMembers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CampaignGroupMemberEmailInfos_RecipientGroupMembers_RecipientMemberId",
                table: "CampaignGroupMemberEmailInfos",
                column: "RecipientMemberId",
                principalTable: "RecipientGroupMembers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CampaignGroupMemberEmailInfos_Campaigns_CampaignEntityId",
                table: "CampaignGroupMemberEmailInfos");

            migrationBuilder.DropForeignKey(
                name: "FK_CampaignGroupMemberEmailInfos_RecipientGroupMembers_RecipientGroupMemberEntityId",
                table: "CampaignGroupMemberEmailInfos");

            migrationBuilder.DropForeignKey(
                name: "FK_CampaignGroupMemberEmailInfos_RecipientGroupMembers_RecipientMemberId",
                table: "CampaignGroupMemberEmailInfos");

            migrationBuilder.DropIndex(
                name: "IX_CampaignGroupMemberEmailInfos_CampaignEntityId",
                table: "CampaignGroupMemberEmailInfos");

            migrationBuilder.DropIndex(
                name: "IX_CampaignGroupMemberEmailInfos_RecipientGroupMemberEntityId",
                table: "CampaignGroupMemberEmailInfos");

            migrationBuilder.DropColumn(
                name: "CampaignEntityId",
                table: "CampaignGroupMemberEmailInfos");

            migrationBuilder.DropColumn(
                name: "RecipientGroupMemberEntityId",
                table: "CampaignGroupMemberEmailInfos");

            migrationBuilder.AddForeignKey(
                name: "FK_CampaignGroupMemberEmailInfos_RecipientGroupMembers_RecipientMemberId",
                table: "CampaignGroupMemberEmailInfos",
                column: "RecipientMemberId",
                principalTable: "RecipientGroupMembers",
                principalColumn: "Id");
        }
    }
}
