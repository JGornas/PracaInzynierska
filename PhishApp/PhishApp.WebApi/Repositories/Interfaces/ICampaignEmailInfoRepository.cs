
namespace PhishApp.WebApi.Repositories.Interfaces
{
    public interface ICampaignEmailInfoRepository
    {
        Task AddEmailInfoAsync(int campaignId, int recipientMemberId, bool isSent, Guid pixelId, Guid? LandingId, string message = "");
        Task UpdateEmailOpenedAsync(Guid pixelId);
        Task UpdateLandingPageOpenedAsync(Guid landingId);
    }
}
