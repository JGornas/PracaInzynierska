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
                throw new InvalidCredentialsException("Nieprawidłowy email lub hasło");

            bool mustSetPassword = !user.IsPasswordSet;

            if (!mustSetPassword)
            {
                var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
                if (!passwordValid)
                    throw new InvalidCredentialsException("Nieprawidłowy email lub hasło");

                var refreshTokenEntity = await GenerateRefreshToken(user);
                refreshToken = refreshTokenEntity.Value!;

            }
            else
            {
                if (request.Password != user.ActivationKey)
                {
                    throw new InvalidCredentialsException("Nieprawidłowy klucz aktywacyjny");
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
                throw new InvalidCredentialsException("Nieprawidłowy użytkownik");

            var mustSetPasswordClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(_mustSetPasswordClaim)?.Value;
            if (mustSetPasswordClaim is null || mustSetPasswordClaim != "True")
                throw new InvalidCredentialsException("Hasło może być ustawione tylko po zalogowaniu kluczem aktywacyjnym");

            if (user.IsPasswordSet == true)
                throw new Exception("Hasło użytkownika zostało już ustawione");

            var result = await _userManager.RemovePasswordAsync(user);

            result = await _userManager.AddPasswordAsync(user, requestInfo.Password);
            if (!result.Succeeded)
                throw new Exception($"Ustawienie nowego hasła nie powiodło się: {string.Join(", ", result.Errors.Select(e => e.Description))}");

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
                throw new SecurityTokenException("Sesja wygasła");

            var tokenEntity = await _tokenRepository.GetRefreshTokenByValueAsync(refreshToken);

            if (tokenEntity == null || tokenEntity.ExpirationTime < DateTime.Now)
                throw new SecurityTokenException("Sesja wygasła");

            var user = await _userManager.FindByIdAsync(tokenEntity.UserId.ToString());
            if (user == null)
                throw new InvalidOperationException("Sesja wygasła");

            var accessToken = GenerateJwtToken(user, mustSetPassword: false);

            var newRefreshToken = await GenerateRefreshToken(user);

            return new AuthTokens
            {
                AccessToken = accessToken,
                RefreshToken = newRefreshToken.Value!
            };
        }

        public async Task<string> RegisterAsync(RegisterRequestInfo request)
        {
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                throw new InvalidOperationException(
                    "Konto z podanym adresem email już istnieje."
                );
            }

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
                throw new ApplicationException(
                    $"Tworzenie użytkownika nie powiodło się: {errors}"
                );
            }

            return activationKey;
        }


        public async Task LogoutAsync(string? refreshToken)
        {
            if (string.IsNullOrEmpty(refreshToken))
                return;

            var tokenEntity = await _tokenRepository.GetRefreshTokenByValueAsync(refreshToken);
            if (tokenEntity != null)
            {
                await _tokenRepository.DeleteRefreshTokenAsync(tokenEntity);
            }
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
                expires: DateTime.Now.AddMinutes(expirationMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }


        private async Task<ApplicationUserToken> GenerateRefreshToken(ApplicationUser user)
        {
            var refreshTokenNewValue = Guid.NewGuid().ToString("N");
            var refreshTokenExpiration = DateTime.Now.AddDays(Constants.RefreshTokenValidityPeriod);
            var refreshToken = await _tokenRepository.SetRefreshTokenAsync(user, refreshTokenNewValue, refreshTokenExpiration);
            return refreshToken;
        }        

    }
}