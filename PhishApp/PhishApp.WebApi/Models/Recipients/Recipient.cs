namespace PhishApp.WebApi.Models.Recipients
{
    public class Recipient
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Position { get; set; }
        public string? ExternalId { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
