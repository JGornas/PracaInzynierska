using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhishApp.WebApi.Models.Identity
{
    [Table("RecipientGroups")]
    public class RecipientGroupEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Campaign { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }

        public ICollection<RecipientGroupMemberEntity> Members { get; set; } = new List<RecipientGroupMemberEntity>();

        public ICollection<CampaignRecipientGroupEntity> CampaignRecipientGroups { get; set; } = new List<CampaignRecipientGroupEntity>();
    }
}
