namespace PhishApp.WebApi.Models.Recipients
{
    public class RecipientGroup
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Campaign { get; set; }
        public DateTime? CreatedAt { get; set; }
        public ICollection<Recipient> Members { get; set; } = new List<Recipient>();
    }
}
