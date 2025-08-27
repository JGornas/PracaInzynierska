using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.IdentityModel.Tokens;
using PhishApp.WebApi.Models.Auth;
using PhishApp.WebApi.Models.Identity;
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

        private const string _mustSetPasswordClaim = "mustSetPassword";

        public AuthService(UserManager<ApplicationUser> userManager, IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _userManager = userManager;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<string> LoginAsync(LoginRequestInfo request)
        {
            // Szukamy użytkownika po emailu
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user is null)
                throw new UnauthorizedAccessException("Invalid credentials");

            bool mustSetPassword = !user.IsPasswordSet;

            if (!mustSetPassword)
            {
                // Użytkownik ma już ustawione hasło — sprawdzamy je
                var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
                if (!passwordValid)
                    throw new UnauthorizedAccessException("Invalid credentials");
            }
            else
            {
                if(request.Password != user.ActivationKey)
                {
                    throw new UnauthorizedAccessException("Invalid credentials");
                }
            }

            // Generujemy token z informacją o potrzebie ustawienia hasła
            var token = GenerateJwtToken(user, mustSetPassword);

            return token;
        }

        public async Task<string> SetPasswordAsync(LoginRequestInfo requestInfo)
        {
            var user = await _userManager.FindByEmailAsync(requestInfo.Email);
            if (user is null)
                throw new UnauthorizedAccessException("Invalid user");

            // Sprawdź, czy token użytkownika wymaga ustawienia hasła
            var mustSetPasswordClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(_mustSetPasswordClaim)?.Value;
            if (mustSetPasswordClaim is null || mustSetPasswordClaim != "True")
                throw new UnauthorizedAccessException("Password can only be set after login with activation key.");
            if (user.IsPasswordSet == true) throw new Exception("User password is already set");

            var result = await _userManager.RemovePasswordAsync(user);

            result = await _userManager.AddPasswordAsync(user, requestInfo.Password);
            if (!result.Succeeded)
                throw new Exception($"Setting new password failed: {string.Join(", ", result.Errors.Select(e => e.Description))}");

            user.IsPasswordSet = true;
            user.ActivationKey = string.Empty;
            await _userManager.UpdateAsync(user);

            var token = GenerateJwtToken(user, false);
            return token;
        }


        public async Task<string> RegisterAsync(RegisterRequestInfo request)
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

    }
}
