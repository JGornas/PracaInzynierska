using HtmlAgilityPack;
using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Repositories.Interfaces;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Services
{
    public class TrackingService : ITrackingService
    {
        private readonly ICampaignEmailInfoRepository _campaignEmailInfoRepository;

        public TrackingService(ICampaignEmailInfoRepository campaignEmailInfoRepository)
        {
            _campaignEmailInfoRepository = campaignEmailInfoRepository;
        }

        public async Task SetEmailOpened(Guid messageId)
        {
            await _campaignEmailInfoRepository.UpdateEmailOpenedAsync(messageId);
        }
        public async Task SetLandingPageOpened(Guid landingId)
        {
            await _campaignEmailInfoRepository.UpdateLandingPageOpenedAsync(landingId);
        }
        public async Task SetFormSubmittedAsync(Guid formSubmitId)
        {
            await _campaignEmailInfoRepository.UpdateFormSubmittedAsync(formSubmitId);
        }
    }
}
