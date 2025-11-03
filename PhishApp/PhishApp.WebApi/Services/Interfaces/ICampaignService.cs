using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Rows;

namespace PhishApp.WebApi.Services.Interfaces
{
    public interface ICampaignService
    {
        Task<GridData<CampaignRow>> GetTemplatesGridData(GridRequest request);
    }
}
