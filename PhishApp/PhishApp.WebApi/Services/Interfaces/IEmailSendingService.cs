using PhishApp.WebApi.Models.SendingProfiles;

namespace PhishApp.WebApi.Services.Interfaces
{
    public interface IEmailSendingService
    {
        Task SendMailAsync(SendingProfile profile, string? recipientEmail, string subject, string body, bool isHtml = true);
    }
}
