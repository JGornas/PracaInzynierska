using Microsoft.AspNetCore.Mvc;
using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Models.Campaigns;
using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.RestApi;
using PhishApp.WebApi.Models.Rows;
using PhishApp.WebApi.Services;
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
            var response = await _campaignService.GetCampaignsGridData(request);

            return RestResponse<GridData<CampaignRow>>.CreateResponse(response);
        }

        [HttpDelete]
        [Route(Routes.DeleteCampaign)]
        public async Task<RestResponse<bool>> DeleteTemplate(int id)
        {
            await _campaignService.DeleteCampaign(id);

            return RestResponse<bool>.CreateResponse(true);
        }

        [HttpGet]
        [Route(Routes.GetCampaign)]
        public async Task<RestResponse<Campaign>> GetTemplate(int id)
        {
            var result = await _campaignService.GetCampaignById(id);

            return RestResponse<Campaign>.CreateResponse(result);
        }
    }
}
