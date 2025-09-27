using System.ComponentModel.DataAnnotations;

namespace PhishApp.WebApi.Models.Identity
{
    public class LandingPageEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

    }
}
