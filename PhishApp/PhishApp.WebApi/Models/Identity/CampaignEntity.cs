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

        public ICollection<CampaignRecipientGroupEntity> CampaignRecipientGroups { get; set; } = new List<CampaignRecipientGroupEntity>();
    }
}
