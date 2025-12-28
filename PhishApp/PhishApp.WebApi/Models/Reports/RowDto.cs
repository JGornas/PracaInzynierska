namespace PhishApp.WebApi.Models.Reports
{
    public class RowDto
    {
        public string? Recipient { get; set; }
        public string? Status { get; set; }
        public string? Sent { get; set; }
        public string? Opened { get; set; }
        public string? Clicked { get; set; }
    }
}
