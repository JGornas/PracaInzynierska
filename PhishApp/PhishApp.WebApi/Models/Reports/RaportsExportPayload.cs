
namespace PhishApp.WebApi.Models.Reports
{
    public class ReportsExportPayload
    {
        public FiltersLabel? Filters { get; set; }
        public ReportsFilterPayload? FiltersRaw { get; set; }
        public string? Title { get; set; }
        public string? GeneratedAt { get; set; }
        public SummaryDto? Summary { get; set; }
        public MetricsDto? Metrics { get; set; }
        public List<BarDto>? Bars { get; set; }
        public List<RowDto>? Rows { get; set; }
    }
}
