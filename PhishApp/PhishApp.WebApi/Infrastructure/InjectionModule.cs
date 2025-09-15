using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Repositories;
using PhishApp.WebApi.Repositories.Interfaces;
using PhishApp.WebApi.Services;
using PhishApp.WebApi.Services.Interfaces;
using System.Text;

namespace PhishApp.WebApi.Infrastructure
{
    public class InjectionModule
    {
        public static void ConfigureServices(IServiceCollection services, ConfigurationManager configuration)
        {
            services.AddHttpContextAccessor();

            services.AddTransient<IAuthService, AuthService>();
            services.AddTransient<ITokenRepository, TokenRepository>();


            services.AddTransient<IGridRepository, GridRepository>();
            services.AddTransient<IGridService, GridService>();

            services.AddTransient<ITemplateRepository, TemplateRepository>();
            services.AddTransient<ITemplateService, TemplateService>();




            services.AddDbContext<DataContext>(options =>
            {
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"));
            });

            services.AddIdentity<ApplicationUser, IdentityRole<int>>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequiredLength = 6;
            })
            .AddEntityFrameworkStores<DataContext>()
            .AddDefaultTokenProviders();

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                //options.RequireHttpsMetadata = true;
                options.SaveToken = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidAudience = configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!))
                };
            });

            services.AddAuthorization(options =>
            {
                options.AddPolicy("ActivatedOnly", policy =>
                    policy.RequireAssertion(ctx =>
                        ctx.User.HasClaim(c => c.Type == "mustSetPassword" && c.Value == "false")));
            });
        }
    }
}
