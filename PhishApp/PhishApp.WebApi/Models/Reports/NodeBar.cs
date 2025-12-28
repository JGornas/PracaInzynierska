namespace PhishApp.WebApi.Models.Reports
{
    public class NodeBar
    {
        public string Label { get; set; } = string.Empty;
        public double Value { get; set; }
        public string ColorStart { get; set; } = "#1d4ed8";
        public string ColorEnd { get; set; } = "#60a5fa";
    }
}
