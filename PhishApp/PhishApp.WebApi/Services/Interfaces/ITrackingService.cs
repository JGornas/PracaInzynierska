
namespace PhishApp.WebApi.Services.Interfaces
{
    public interface ITrackingService
    {
        Task SetEmailOpened(Guid messageId);
    }
}
