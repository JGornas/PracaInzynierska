using Microsoft.AspNetCore.Mvc;
using PhishApp.WebApi.Helpers;

namespace PhishApp.WebApi.Controllers
{
    [ApiController]
    public class TestController : ControllerBase
    {
        [HttpGet]
        [Route(Routes.Ping)]
        public string Ping()
        {
            return "pong";
        }
    }
}
