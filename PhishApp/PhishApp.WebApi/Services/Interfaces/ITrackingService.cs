
namespace PhishApp.WebApi.Services.Interfaces
{
    public interface ITrackingService
    {
        Task SetEmailOpened(Guid messageId);
        Task SetLandingPageOpened(Guid landingId);
        Task SetFormSubmittedAsync(Guid formSubmitId);
    }
}
