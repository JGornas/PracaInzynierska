using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhishApp.WebApi.Models.SendingProfiles
{
    [Table("SendingProfiles")]
    public class SendingProfileEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Protocol { get; set; } = "SMTP";

        [Required]
        [MaxLength(200)]
        public string SenderName { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string SenderEmail { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Host { get; set; } = string.Empty;

        public int Port { get; set; } = 587;

        [Required]
        [MaxLength(200)]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        public bool UseSsl { get; set; } = true;

        [MaxLength(200)]
        public string? ReplyTo { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
