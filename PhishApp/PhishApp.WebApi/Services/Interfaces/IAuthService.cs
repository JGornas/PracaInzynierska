using PhishApp.WebApi.Models.Auth;

namespace PhishApp.WebApi.Services.Interfaces
{
    public interface IAuthService
    {
        Task<string> LoginAsync(LoginRequestInfo request);
        Task<string> RegisterAsync(RegisterRequestInfo request);
        Task<string> SetPasswordAsync(LoginRequestInfo requestInfo);
    }
}
