namespace PhishApp.WebApi.Models.Reports
{
    public class NodeRow
    {
        public string Recipient { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string StatusColor { get; set; } = "#334155";
        public string Sent { get; set; } = "--";
        public string Opened { get; set; } = "--";
        public string Clicked { get; set; } = "--";
    }
}
