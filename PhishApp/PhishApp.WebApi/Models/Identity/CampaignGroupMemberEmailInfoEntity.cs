using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhishApp.WebApi.Models.Identity
{
    [Table("CampaignGroupMemberEmailInfos")]
    public class CampaignGroupMemberEmailInfoEntity
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey(nameof(Campaign))]
        public int CampaignId { get; set; }
        public CampaignEntity Campaign { get; set; } = null!;

        [ForeignKey(nameof(RecipientMember))]
        public int? RecipientMemberId { get; set; }
        public RecipientGroupMemberEntity? RecipientMember { get; set; } = null!;

        public bool IsSent { get; set; } = false;

        public DateTime? SentAt { get; set; }

        public string Message { get; set; } = string.Empty;

        public Guid PixelId { get; set; }

        public bool IsEmailOpened { get; set; } = false;
        public DateTime? OpenedTime { get; set; } = null;

        public Guid? LandingId { get; set; } = null;
        public bool IsRedirectedToLandingPage { get; set; } = false;
        public DateTime? RedirectedToLandingPageTime { get; set; } = null;

        public Guid? FormSubmitId { get; set; } = null;
        public bool IsFormSubmitted { get; set; } = false;
        public DateTime? FormSubmittedTime { get; set; } = null;

    }
}
