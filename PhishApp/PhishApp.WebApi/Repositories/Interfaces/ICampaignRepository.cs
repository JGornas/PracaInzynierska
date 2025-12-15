using PhishApp.WebApi.Models.Identity;

namespace PhishApp.WebApi.Repositories.Interfaces
{
    public interface ICampaignRepository
    {
        Task<CampaignEntity?> GetByIdAsync(int id);
        Task AddAsync(CampaignEntity campaign);
        Task UpdateAsync(CampaignEntity campaign);
        Task DeleteWithRelationsAsync(int id);
        Task<List<CampaignEntity>> GetNotSentAync();
        Task MarkAsSentAsync(int campaignId, bool isSentSuccessfully);
        Task<CampaignEntity?> GetCampaignByLandingId(Guid landingId);
    }
}
