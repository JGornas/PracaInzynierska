using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Rows;
using PhishApp.WebApi.Repositories.Interfaces;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Services
{
    public class CampaignService : ICampaignService
    {
        private readonly ICampaignRepository _campaignRepository;
        private readonly IGridService _gridService;

        public CampaignService(ICampaignRepository campaignRepository, IGridService gridService)
        {
            _campaignRepository = campaignRepository;
            _gridService = gridService;
        }

        public async Task<GridData<CampaignRow>> GetTemplatesGridData(GridRequest request)
        {
            return await _gridService.GetGridData<CampaignRow>(request);
        }
    }
}
