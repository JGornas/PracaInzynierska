using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhishApp.WebApi.Models.Identity
{
    [Table("RecipientGroupMembers")]
    public class RecipientGroupMemberEntity
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey(nameof(Group))]
        public int GroupId { get; set; }

        public RecipientGroupEntity Group { get; set; } = null!;

        [ForeignKey(nameof(Recipient))]
        public int RecipientId { get; set; }

        public RecipientEntity Recipient { get; set; } = null!;
    }
}
