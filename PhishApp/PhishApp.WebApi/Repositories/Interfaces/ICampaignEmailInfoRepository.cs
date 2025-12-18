
namespace PhishApp.WebApi.Repositories.Interfaces
{
    public interface ICampaignEmailInfoRepository
    {
        Task AddEmailInfoAsync(int campaignId, int recipientMemberId, bool isSent, Guid pixelId, Guid? LandingId, Guid? FormSubmitId, string message = "");
        Task UpdateEmailOpenedAsync(Guid pixelId);
        Task UpdateFormSubmittedAsync(Guid formSubmitId);
        Task UpdateLandingPageOpenedAsync(Guid landingId);
    }
}
