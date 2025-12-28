namespace PhishApp.WebApi.Models.Reports
{
    public class InteractionReportDto
    {
        public int Id { get; set; }
        public int CampaignId { get; set; }
        public string CampaignName { get; set; } = string.Empty;
        public int? GroupId { get; set; }
        public string? GroupName { get; set; }
        public string RecipientEmail { get; set; } = string.Empty;
        public string? RecipientName { get; set; }
        public DateTime? SentAt { get; set; }
        public DateTime? OpenedAt { get; set; }
        public DateTime? ClickedAt { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public bool Opened { get; set; }
        public bool Clicked { get; set; }
        public bool Submitted { get; set; }
    }
}
