using PhishApp.WebApi.Models.Campaigns;
using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Rows;

namespace PhishApp.WebApi.Services.Interfaces
{
    public interface ICampaignService
    {
        Task DeleteCampaign(int id);
        Task<Campaign?> GetCampaignById(int id);
        Task<GridData<CampaignRow>> GetCampaignsGridData(GridRequest request);
        Task<Campaign> UpdateCampaign(Campaign campaign);
    }
}
