using PhishApp.WebApi.Models.Identity;

namespace PhishApp.WebApi.Repositories.Interfaces
{
    public interface ITokenRepository
    {
        Task<ApplicationUserToken?> GetRefreshTokenByValueAsync(string value);
        Task<ApplicationUserToken> SetRefreshTokenAsync(ApplicationUser user, string tokenValue, DateTime expires);
    }
}
