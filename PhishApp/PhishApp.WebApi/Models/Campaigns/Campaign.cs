using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.Recipients;
using System.ComponentModel.DataAnnotations;

namespace PhishApp.WebApi.Models.Campaigns
{
    public class Campaign
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public List<RecipientGroup> CampaignRecipientGroups { get; set; } = new List<RecipientGroup>();
    }
}
