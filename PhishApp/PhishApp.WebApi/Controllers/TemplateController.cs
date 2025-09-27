using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.RestApi;
using PhishApp.WebApi.Models.RestApi.Auth;
using PhishApp.WebApi.Models.Rows;
using PhishApp.WebApi.Models.Templates;
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
        public async Task<RestResponse<GridData<TemplateRow>>> GetGridData(GridRequest request)
        {
           var response = await _templateService.GetTemplatesGridData(request);

           return RestResponse<GridData<TemplateRow>>.CreateResponse(response);
        }

        [HttpPost]
        [Route(Routes.UpdateTemplate)]
        public async Task<RestResponse<Template>> UpdateTemplate(Template template)
        {
            var response = await _templateService.UpdateTemplate(template);

            return RestResponse<Template>.CreateResponse(response);
        }

        [HttpGet]
        [Route(Routes.GetTemplate)]
        public async Task<RestResponse<Template>> GetTemplate(int id)
        {
            var response = await _templateService.GetTemplate(id);

            return RestResponse<Template>.CreateResponse(response);
        }

        [HttpDelete]
        [Route(Routes.DeleteTemplate)]
        public async Task<RestResponse<bool>> DeleteTemplate(int id)
        {
            await _templateService.DeleteTemplate(id);

            return RestResponse<bool>.CreateResponse(true);
        }
    }
}
