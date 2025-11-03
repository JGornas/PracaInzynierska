using Microsoft.AspNetCore.Mvc;
using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.RestApi;
using PhishApp.WebApi.Models.Rows;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Controllers
{
    [ApiController]
    public class CampaignController : ControllerBase
    {
        private readonly ICampaignService _campaignService;
        public CampaignController(ICampaignService templateService)
        {
            _campaignService = templateService;
        }

        [HttpPost]
        [Route(Routes.CampaignsGrid)]
        public async Task<RestResponse<GridData<CampaignRow>>> GetGridData(GridRequest request)
        {
            var response = await _campaignService.GetTemplatesGridData(request);

            return RestResponse<GridData<CampaignRow>>.CreateResponse(response);
        }
    }
}
