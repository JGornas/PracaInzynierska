namespace PhishApp.WebApi.Models.SendingProfiles
{
    public class SendingProfile
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Protocol { get; set; } = "SMTP";
        public string SenderName { get; set; } = string.Empty;
        public string SenderEmail { get; set; } = string.Empty;
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; } = 587;
        public string Username { get; set; } = string.Empty;
        public string? Password { get; set; }
        public bool UseSsl { get; set; } = true;
        public string? ReplyTo { get; set; }
        public bool HasPassword { get; set; }
        public string? TestEmail { get; set; }
    }
}
