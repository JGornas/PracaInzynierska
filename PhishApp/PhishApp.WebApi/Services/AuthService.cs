using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.IdentityModel.Tokens;
using PhishApp.WebApi.Exceptions;
using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Models.Auth;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.RestApi.Auth;
using PhishApp.WebApi.Repositories.Interfaces;
using PhishApp.WebApi.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PhishApp.WebApi.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ITokenRepository _tokenRepository;

        private const string _mustSetPasswordClaim = "mustSetPassword";

        public AuthService(UserManager<ApplicationUser> userManager, IConfiguration configuration, IHttpContextAccessor httpContextAccessor, ITokenRepository tokenRepository)
        {
            _userManager = userManager;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
            _tokenRepository = tokenRepository;
        }

        public async Task<AuthTokens> LoginAsync(LoginRequestInfo request)
        {
            string refreshToken = string.Empty;

            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user is null)
                throw new InvalidCredentialsException();

            bool mustSetPassword = !user.IsPasswordSet;

            if (!mustSetPassword)
            {
                var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
                if (!passwordValid)
                    throw new InvalidCredentialsException();

                var refreshTokenEntity = await GenerateRefreshToken(user);
                refreshToken = refreshTokenEntity.Value!;

            }
            else
            {
                if (request.Password != user.ActivationKey)
                {
                    throw new InvalidCredentialsException();
                }
            }

            var token = GenerateJwtToken(user, mustSetPassword);

            var response = new AuthTokens
            {
                AccessToken = token,
                RefreshToken = refreshToken,
            };

            return response;
        }


        public async Task<AuthTokens> SetPasswordAsync(LoginRequestInfo requestInfo)
        {
            var user = await _userManager.FindByEmailAsync(requestInfo.Email);
            if (user is null)
                throw new InvalidCredentialsException("Invalid user");

            var mustSetPasswordClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(_mustSetPasswordClaim)?.Value;
            if (mustSetPasswordClaim is null || mustSetPasswordClaim != "True")
                throw new InvalidCredentialsException("Password can only be set after login with activation key.");
            if (user.IsPasswordSet == true) throw new Exception("User password is already set");

            var result = await _userManager.RemovePasswordAsync(user);

            result = await _userManager.AddPasswordAsync(user, requestInfo.Password);
            if (!result.Succeeded)
                throw new Exception($"Setting new password failed: {string.Join(", ", result.Errors.Select(e => e.Description))}");

            user.IsPasswordSet = true;
            user.ActivationKey = string.Empty;
            await _userManager.UpdateAsync(user);

            var token = GenerateJwtToken(user, false);
            var refreshToken = await GenerateRefreshToken(user);

            var response = new AuthTokens
            {
                AccessToken = token,
                RefreshToken = refreshToken.Value!,
            };
            return response;
        }

        public async Task<AuthTokens> RefreshTokenAsync(string? refreshToken)
        {
            if (string.IsNullOrEmpty(refreshToken))
                throw new SecurityTokenException("Refresh token is required.");

            var tokenEntity = await _tokenRepository.GetRefreshTokenByValueAsync(refreshToken);

            if (tokenEntity == null || tokenEntity.ExpirationTime < DateTime.UtcNow)
                throw new SecurityTokenException("Invalid or expired refresh token.");

            var user = await _userManager.FindByIdAsync(tokenEntity.UserId.ToString());
            if (user == null)
                throw new InvalidOperationException("Invalid user.");

            var accessToken = GenerateJwtToken(user, mustSetPassword: false);

            var newRefreshToken = await GenerateRefreshToken(user);

            return new AuthTokens
            {
                AccessToken = accessToken,
                RefreshToken = newRefreshToken.Value!
            };
        }


        public async Task<string> RegisterAsync(LoginRequestInfo request)
        {
            // Tworzymy losowy klucz aktywacyjny
            var activationKey = Guid.NewGuid().ToString("N");

            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                IsPasswordSet = false,
                ActivationKey = activationKey
            };

            var result = await _userManager.CreateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"User creation failed: {errors}");
            }

            return activationKey;
        }



        private string GenerateJwtToken(ApplicationUser user, bool mustSetPassword)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName!),
                new Claim(_mustSetPasswordClaim, mustSetPassword.ToString())
            };

            var keyString = _configuration["Jwt:Key"]!;

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expirationMinutes = Convert.ToInt32(_configuration["Jwt:TokenExpirationInMinutes"]);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }


        private async Task<string> SetRefreshToken(ApplicationUser user)
        {
            var existingRefreshToken = await _tokenRepository.GetRefreshTokenAsync(user);
            if (existingRefreshToken is null || existingRefreshToken.ExpirationTime <= DateTime.UtcNow)
            {
                var refreshToken = await GenerateRefreshToken(user);
                return refreshToken.Value!;
            }
            return existingRefreshToken.Value!;
        }

        private async Task<ApplicationUserToken> GenerateRefreshToken(ApplicationUser user)
        {
            var refreshTokenNewValue = Guid.NewGuid().ToString("N");
            var refreshTokenExpiration = DateTime.UtcNow.AddDays(Constants.RefreshTokenValidityPeriod);
            var refreshToken = await _tokenRepository.SetRefreshTokenAsync(user, refreshTokenNewValue, refreshTokenExpiration);
            return refreshToken;

        }
    }
}
