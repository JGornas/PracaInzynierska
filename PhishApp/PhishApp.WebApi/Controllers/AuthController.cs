using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Models;
using PhishApp.WebApi.Models.Auth;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Controllers
{
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }


        [HttpPost]
        [Route(Routes.Login)]
        [AllowAnonymous]
        public async Task<RestResponse<string>> Login(LoginRequestInfo request)
        {
            var response = await _authService.LoginAsync(request);
            return RestResponse<string>.CreateSuccessResponse(response);
        }

        [HttpPost]
        [Route(Routes.SetPassword)]
        public async Task<RestResponse<string>> SetPassword(LoginRequestInfo request)
        {
            var response = await _authService.SetPasswordAsync(request);
            return RestResponse<string>.CreateSuccessResponse(response);
        }
        
        [HttpPost]
        [Route(Routes.Register)]
        [AllowAnonymous] //TODO w jakiś sposób trzeba ustawić aby tylko adimn mogl to wykonywac
        public async Task<RestResponse<string>> Register(RegisterRequestInfo request)
        {
            var response = await _authService.RegisterAsync(request);
            return RestResponse<string>.CreateSuccessResponse(response);
        }
    }
}
