namespace PhishApp.WebApi.Models.Reports
{
    public class ReportsFiltersDto
    {
        public List<ReportSelectOption> Campaigns { get; set; } = new();
        public List<ReportGroupOption> Groups { get; set; } = new();
    }
}
