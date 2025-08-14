using PhishApp.WebApi.Services;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Infrastructure
{
    public class InjectionModule
    {
        public static void ConfigureServices(IServiceCollection services)
        {
            services.AddHttpContextAccessor();

            services.AddTransient<ITestService, TestService>();
        }
    }
}
