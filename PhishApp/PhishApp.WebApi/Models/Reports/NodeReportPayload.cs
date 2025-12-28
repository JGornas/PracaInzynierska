namespace PhishApp.WebApi.Models.Reports
{
    public class NodeReportPayload
    {
        public string Title { get; set; } = string.Empty;
        public string GeneratedAt { get; set; } = string.Empty;
        public NodeFilters Filters { get; set; } = new();
        public SummaryDto Summary { get; set; } = new();
        public MetricsDto Metrics { get; set; } = new();
        public List<NodeBar> Bars { get; set; } = new();
        public List<NodeRow> Rows { get; set; } = new();
    }
}
