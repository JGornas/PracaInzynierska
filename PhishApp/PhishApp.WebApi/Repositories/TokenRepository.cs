using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Infrastructure;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Repositories.Interfaces;

namespace PhishApp.WebApi.Repositories
{
    public class TokenRepository : ITokenRepository
    {
        private readonly DataContext _context;

        public TokenRepository(DataContext context)
        {
            _context = context;
        }


        public async Task<ApplicationUserToken> SetRefreshTokenAsync(ApplicationUser user, string tokenValue, DateTime expires)
        {
            ApplicationUserToken refreshToken;
            // Sprawdź, czy istnieje już refresh token
            var existingToken = await _context.UserTokens
                .FirstOrDefaultAsync(t => t.UserId == user.Id && t.LoginProvider == Constants.TokenProvider && t.Name == Constants.RefreshTokenName);

            if (existingToken != null)
            {
                existingToken.Value = tokenValue;
                existingToken.ExpirationTime = expires;
                _context.UserTokens.Update(existingToken);
                refreshToken = existingToken;
            }
            else
            {
                var token = new ApplicationUserToken
                {
                    UserId = user.Id,
                    LoginProvider = Constants.TokenProvider,
                    Name = Constants.RefreshTokenName,
                    Value = tokenValue,
                    ExpirationTime = expires
                };
                _context.UserTokens.Add(token);
                refreshToken = token;
            }

            await _context.SaveChangesAsync();

            return refreshToken;
        }

        public async Task<ApplicationUserToken?> GetRefreshTokenAsync(ApplicationUser user)
        {
            var token = await _context.UserTokens
                .Where(t => t.UserId == user.Id && t.LoginProvider == Constants.TokenProvider && t.Name == Constants.RefreshTokenName)
                .FirstOrDefaultAsync();

            return token;
        }

        public async Task<ApplicationUserToken?> GetRefreshTokenByValueAsync(string value)
        {
            var token = await _context.UserTokens
                .Where(t => t.Value == value && t.LoginProvider == Constants.TokenProvider && t.Name == Constants.RefreshTokenName)
                .FirstOrDefaultAsync();

            return token;
        }

    }
}
