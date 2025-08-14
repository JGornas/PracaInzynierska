using Microsoft.AspNetCore.Mvc;
using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Models;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Controllers
{
    [ApiController]
    public class TestController : ControllerBase
    {
        private readonly ITestService _testService;

        public TestController(ITestService testService)
        {
            _testService = testService;
        }

        [HttpGet]
        [Route(Routes.PingError)]
        public RestResponse<string> PingError()
        {
            var response = _testService.GetMessageError();
            return RestResponse<string>.CreateSuccessResponse(response);
        }

        [HttpGet]
        [Route(Routes.Ping)]
        public RestResponse<string> Ping()
        {
            var response = _testService.GetMessage();
            return RestResponse<string>.CreateSuccessResponse(response);
        }
    }
}
