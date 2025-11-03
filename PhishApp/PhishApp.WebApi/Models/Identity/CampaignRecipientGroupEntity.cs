using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhishApp.WebApi.Models.Identity
{
    [Table("CampaignRecipientGroups")]
    public class CampaignRecipientGroupEntity
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey(nameof(Campaign))]
        public int CampaignId { get; set; }

        [ForeignKey(nameof(RecipientGroup))]
        public int RecipientGroupId { get; set; }

        public CampaignEntity Campaign { get; set; } = null!;
        public RecipientGroupEntity RecipientGroup { get; set; } = null!;
    }
}
