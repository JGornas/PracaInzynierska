using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Models.RestApi;
using PhishApp.WebApi.Models.RestApi.Auth;
using PhishApp.WebApi.Services;
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

        [HttpGet]
        [Route(Routes.Ping)]
        public RestResponse<string> Ping()
        {
            return RestResponse<string>.CreateResponse("pong");
        }

        [HttpGet]
        [Route(Routes.PingError)]
        [AllowAnonymous]
        public RestResponse<string> PingError()
        {
            
            throw new Exception("This is a test exception for error handling.");
        }

        [HttpPost]
        [Route(Routes.Login)]
        [AllowAnonymous]
        public async Task<RestResponse<string>> Login(LoginRequestInfo request)
        {
            var response = await _authService.LoginAsync(request);
            Response.Cookies.Append("refreshToken", response.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(Constants.RefreshTokenValidityPeriod)
            });
            return RestResponse<string>.CreateResponse(response.AccessToken);
        }

        [HttpPost]
        [Route(Routes.SetPassword)]
        public async Task<RestResponse<string>> SetPassword(LoginRequestInfo request)
        {
            var response = await _authService.SetPasswordAsync(request);

            Response.Cookies.Append("refreshToken", response.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(Constants.RefreshTokenValidityPeriod)
            });

            return RestResponse<string>.CreateResponse(response.AccessToken);
        }



        [HttpPost]
        [Route(Routes.RefreshAccessToken)]
        [AllowAnonymous]
        public async Task<RestResponse<string>> RefreshAccessToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            var response = await _authService.RefreshTokenAsync(refreshToken);
            Response.Cookies.Append("refreshToken", response.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(Constants.RefreshTokenValidityPeriod)
            });
            return RestResponse<string>.CreateResponse(response.AccessToken);
        }

        [HttpPost]
        [Route(Routes.Logout)]
        public async Task<RestResponse<bool>> Logout()
        {
            var refreshToken = Request.Cookies["refreshToken"];

            await _authService.LogoutAsync(refreshToken);

            Response.Cookies.Delete("refreshToken");

            return RestResponse<bool>.CreateResponse(true);
        }


        [HttpPost]
        [Route(Routes.Register)]
        [AllowAnonymous] //TODO w jakiś sposób trzeba ustawić aby tylko adimn mogl to wykonywac
        public async Task<RestResponse<string>> Register(LoginRequestInfo request)
        {
            var response = await _authService.RegisterAsync(request);
            return RestResponse<string>.CreateResponse(response);
        }
    }
}
