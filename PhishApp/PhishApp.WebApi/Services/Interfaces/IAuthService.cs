using PhishApp.WebApi.Models.Auth;
using PhishApp.WebApi.Models.RestApi.Auth;

namespace PhishApp.WebApi.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthTokens> LoginAsync(LoginRequestInfo request);
        Task LogoutAsync(string? refreshToken);
        Task<AuthTokens> RefreshTokenAsync(string? refreshToken);
        Task<string> RegisterAsync(RegisterRequestInfo request);
        Task<AuthTokens> SetPasswordAsync(LoginRequestInfo requestInfo);
    }
}
