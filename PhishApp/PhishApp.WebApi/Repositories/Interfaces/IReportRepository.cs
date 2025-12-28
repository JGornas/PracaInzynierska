
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.Reports;

namespace PhishApp.WebApi.Repositories.Interfaces
{
    public interface IReportRepository
    {
        Task<List<InteractionReportDto>> GetInteractionRow(ReportsFilterPayload payload);
        Task<List<ReportSelectOption>> GetReportCampaignsFilter();
        Task<List<ReportGroupOption>> GetReportGroupsFilter();
        Task<SummaryDto> GetReportSummary(ReportsFilterPayload payload);
    }
}
