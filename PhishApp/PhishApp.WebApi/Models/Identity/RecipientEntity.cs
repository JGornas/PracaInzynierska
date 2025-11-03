using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhishApp.WebApi.Models.Identity
{
    [Table("Recipients")]
    public class RecipientEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? FirstName { get; set; }

        [MaxLength(200)]
        public string? LastName { get; set; }

        [MaxLength(200)]
        public string? Position { get; set; }

        [MaxLength(200)]
        public string? ExternalId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public ICollection<RecipientGroupMemberEntity> GroupMemberships { get; set; } = new List<RecipientGroupMemberEntity>();
    }
}
