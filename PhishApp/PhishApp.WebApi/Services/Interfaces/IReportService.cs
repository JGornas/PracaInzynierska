using PhishApp.WebApi.Models.Reports;
using PhishApp.WebApi.Models.RestApi;

namespace PhishApp.WebApi.Services.Interfaces
{
    public interface IReportService
    {
        Task<ReportExportResult> ExportReportAsync(ReportsExportPayload safePayload);
        Task<ReportsFiltersDto> GetFilters();
        Task<List<InteractionReportDto>> GetInteractions(ReportsFilterPayload payload);
        Task<SummaryDto> GetReportSummary(ReportsFilterPayload payload);
    }
}
