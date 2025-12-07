using Org.BouncyCastle.Asn1.Mozilla;
using System.ComponentModel.DataAnnotations;

namespace PhishApp.WebApi.Models.Identity
{
    public class CampaignEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Description { get; set; } = string.Empty;

        public int? SendingProfileId { get; set; }
        public SendingProfileEntity? SendingProfile { get; set; }

        public int? TemplateId { get; set; }
        public TemplateEntity? Template { get; set; }

        public int? LandingPageId { get; set; }
        public LandingPageEntity? LandingPage { get; set; }

        public DateTime? SendTime { get; set; }

        public bool IsSentSuccessfully { get; set; } = false;

        public ICollection<CampaignRecipientGroupEntity> CampaignRecipientGroups { get; set; } = new List<CampaignRecipientGroupEntity>();
    }
}
