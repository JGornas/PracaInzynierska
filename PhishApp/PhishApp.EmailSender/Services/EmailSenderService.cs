using Microsoft.EntityFrameworkCore.Migrations.Operations;
using PhishApp.EmailSender.Services.Interfaces;
using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Models.Campaigns;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.Recipients;
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
                await HandleCampaignSending(campaign);
            }
        }

        private async Task HandleCampaignSending(Campaign campaign)
        {

            foreach (var group in campaign.CampaignRecipientGroups)
            {
                foreach(var reciepient in group.Members)
                {
                    await HandleCampaignRecipientSending(campaign, reciepient);
                }
            }

            await _campaignService.MarkCampaignAsSentAsync(campaign.Id, true);
        }

        private async Task HandleCampaignRecipientSending(Campaign campaign, Recipient reciepient)
        {
            _logService.Info($"Próba wysłania maila do odbiorcy {reciepient.Email}: {reciepient.FirstName} {reciepient.LastName}, Szablon: {campaign.Template?.Id ?? 0}");

            Guid pixelId = Guid.NewGuid();

            var contentWithPixel = GetEmailContentWithPixel(campaign.Template?.Content, pixelId);

            try
            {
                await _emailSendingService.SendMailAsync(
                campaign.SendingProfile!,
                reciepient.Email,
                campaign.Template?.Subject ?? string.Empty,
                contentWithPixel);

                await _campaignService.AddEmailInfoAsync(campaign.Id, reciepient.GroupMemberId, true, pixelId);
                //udalo sie wyslac
            }
            catch (Exception e)
            {
                string message = $"Błąd podczas wysyłania maila do {reciepient.Email}: {e.Message}";
                await _campaignService.AddEmailInfoAsync(campaign.Id, reciepient.GroupMemberId, false, pixelId, message);
                //nie udalo sie wyslac
            }
        }

        private string GetEmailContentWithPixel(string? templateContent, Guid pixelId)
        {
            string pixelUrl = $"{Constants.NGrokUrl}/api/pixel/{pixelId}.png";

            string pixelHtml = $"<img src=\"{pixelUrl}\" width=\"100\" height=\"50\" style=\"background:#fff;border:1px solid #ccc;display:block;\" alt=\"Test ładowania\" />";


            string content = templateContent ?? string.Empty;

            if (string.IsNullOrWhiteSpace(content))
            {
                return $"<html><body>{pixelHtml}</body></html>";
            }

            const string bodyClosingTag = "</body>";
            int index = content.IndexOf(bodyClosingTag, StringComparison.OrdinalIgnoreCase);

            if (index >= 0)
            {
                return content.Insert(index, pixelHtml + "\n");
            }

            return content + "\n" + pixelHtml;
        }

    }
}
