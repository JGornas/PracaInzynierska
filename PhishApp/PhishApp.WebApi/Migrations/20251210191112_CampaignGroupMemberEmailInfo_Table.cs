using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhishApp.WebApi.Migrations
{
    /// <inheritdoc />
    public partial class CampaignGroupMemberEmailInfo_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CampaignGroupMemberEmailInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CampaignId = table.Column<int>(type: "int", nullable: false),
                    RecipientMemberId = table.Column<int>(type: "int", nullable: false),
                    IsSent = table.Column<bool>(type: "bit", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CampaignGroupMemberEmailInfos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CampaignGroupMemberEmailInfos_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalTable: "Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CampaignGroupMemberEmailInfos_RecipientGroupMembers_RecipientMemberId",
                        column: x => x.RecipientMemberId,
                        principalTable: "RecipientGroupMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CampaignGroupMemberEmailInfos_CampaignId",
                table: "CampaignGroupMemberEmailInfos",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_CampaignGroupMemberEmailInfos_RecipientMemberId",
                table: "CampaignGroupMemberEmailInfos",
                column: "RecipientMemberId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CampaignGroupMemberEmailInfos");
        }
    }
}
