using PhishApp.WebApi.Models.Auth;
using PhishApp.WebApi.Models.RestApi.Auth;

namespace PhishApp.WebApi.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthTokens> LoginAsync(LoginRequestInfo request);
        Task<AuthTokens> RefreshTokenAsync(string? refreshToken);
        Task<string> RegisterAsync(LoginRequestInfo request);
        Task<AuthTokens> SetPasswordAsync(LoginRequestInfo requestInfo);
    }
}
