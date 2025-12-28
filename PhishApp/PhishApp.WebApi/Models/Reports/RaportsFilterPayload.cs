namespace PhishApp.WebApi.Models.Reports
{
    public class ReportsFilterPayload
    {
        public int? CampaignId { get; set; }
        public int? GroupId { get; set; }
        public string? DateFrom { get; set; }
        public string? DateTo { get; set; }
    }
}
