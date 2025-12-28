namespace PhishApp.WebApi.Models.Reports
{
    public class SummaryDto
    {
        public int Sent { get; set; }
        public int Opened { get; set; }
        public int Clicked { get; set; }
        public int Submitted { get; set; }
    }
}
