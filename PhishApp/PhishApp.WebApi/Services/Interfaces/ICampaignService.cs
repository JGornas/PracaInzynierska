using PhishApp.WebApi.Models.Campaigns;
using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.Rows;

namespace PhishApp.WebApi.Services.Interfaces
{
    public interface ICampaignService
    {
        Task AddEmailInfoAsync(int campaignId, int recipientMemberId, bool isSent, Guid pixelId, Guid? landingId, string message = "");
        Task DeleteCampaign(int id);
        Task<Campaign?> GetCampaignById(int id);
        Task<Campaign?> GetCampaignByLandingId(Guid id);
        Task<GridData<CampaignRow>> GetCampaignsGridData(GridRequest request);
        Task<List<Campaign>> GetNotSent();
        Task<List<Campaign>> GetNotSentAync();
        Task MarkCampaignAsSentAsync(int campaignId, bool isSentSuccessfully);
        Task<Campaign> UpdateCampaign(Campaign campaign);
    }
}
