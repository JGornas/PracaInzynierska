using PhishApp.EmailSender.Services.Interfaces;
using PhishApp.WebApi.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PhishApp.EmailSender.Services
{
    public class EmailSenderService : IEmailSenderService
    {
        private readonly IEmailSendingService _emailSendingService;
        private readonly ITemplateService _templateService;
        private readonly ICampaignService _campaignService;
        private readonly IRecipientService _recipientService;
        private readonly IAppLoggService _logService;


        public EmailSenderService(IEmailSendingService emailSendingService, ITemplateService templateService, ICampaignService campaignService, IRecipientService recipientService, IAppLoggService logService)
        {
            _emailSendingService = emailSendingService;
            _templateService = templateService;
            _campaignService = campaignService;
            _recipientService = recipientService;
            _logService = logService;
        }

        public async Task Start()
        {
            _logService.Info("Email Sender Service uruchomiony.");

            var campaigns = await _campaignService.GetNotSentAync();

            if (campaigns == null || !campaigns.Any())
            {
                _logService.Info("Brak kampanii do wysłania.");
                return;
            }

            var campaignIds = campaigns.Select(c => c.Id.ToString());
            var idsString = string.Join(", ", campaignIds);

            _logService.Info($"Wysyłanie kampanii o ID: {idsString}");

            foreach (var campaign in campaigns)
            {
                _logService.Info($"Przetwarzanie kampanii o ID: {campaign.Id}, nazwa: {campaign.Name}");
            }
        }

    }
}
