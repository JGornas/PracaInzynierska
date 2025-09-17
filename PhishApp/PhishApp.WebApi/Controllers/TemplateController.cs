using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.RestApi;
using PhishApp.WebApi.Models.RestApi.Auth;
using PhishApp.WebApi.Models.Rows;
using PhishApp.WebApi.Services;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Controllers
{
    [ApiController]
    public class TemplateController : ControllerBase
    {
        private readonly ITemplateService _templateService;

        public TemplateController(ITemplateService templateService)
        {
            _templateService = templateService;
        }
        

        [HttpPost]
        [Route(Routes.TemplatesGrid)]
        [AllowAnonymous]
        public async Task<RestResponse<GridData<TemplateRow>>> Login(GridRequest request)
        {
           var response = await _templateService.GetTemplatesGridData(request);

           return RestResponse<GridData<TemplateRow>>.CreateResponse(response);
        }
    }
}
