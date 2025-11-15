using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.LandingPages;
using PhishApp.WebApi.Models.Recipients;
using PhishApp.WebApi.Models.SendingProfiles;
using PhishApp.WebApi.Models.Templates;
using System.ComponentModel.DataAnnotations;

namespace PhishApp.WebApi.Models.Campaigns
{
    public class Campaign
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime? SendTime { get; set; }

        public SendingProfile? SendingProfile { get; set; }
        public Template? Template { get; set; }

        public LandingPage? LandingPage { get; set; }


        public List<RecipientGroup> CampaignRecipientGroups { get; set; } = new List<RecipientGroup>();
    }
}
