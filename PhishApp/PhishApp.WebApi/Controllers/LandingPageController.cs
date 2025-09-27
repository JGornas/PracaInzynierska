using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.LandingPages;
using PhishApp.WebApi.Models.RestApi;
using PhishApp.WebApi.Models.Rows;
using PhishApp.WebApi.Models.Templates;
using PhishApp.WebApi.Services;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Controllers
{
    [ApiController]
    [Authorize]
    public class LandingPageController : ControllerBase
    {
        private readonly ILandingPageService _landingPageService;
        public LandingPageController(ILandingPageService landingPageService)
        {
            _landingPageService = landingPageService;
        }

        [HttpPost]
        [Route(Routes.LandingPagesGrid)]
        public async Task<RestResponse<GridData<LandingPageEntity>>> GetGridData(GridRequest request)
        {
            var response = await _landingPageService.GetLandingPagesGridData(request);

            return RestResponse<GridData<LandingPageEntity>>.CreateResponse(response);
        }

        [HttpDelete]
        [Route(Routes.DeleteLandingPage)]
        public async Task<RestResponse<bool>> DeleteLandingPage(int id)
        {
            await _landingPageService.DeleteLandingPage(id);

            return RestResponse<bool>.CreateResponse(true);
        }

        [HttpGet]
        [Route(Routes.GetLandingPage)]
        public async Task<RestResponse<LandingPage>> GetLandingPage(int id)
        {
            var response = await _landingPageService.GetLandingPage(id);

            return RestResponse<LandingPage>.CreateResponse(response);
        }
    }
}
