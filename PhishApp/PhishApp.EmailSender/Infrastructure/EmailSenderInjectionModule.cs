using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NLog.Extensions.Logging;
using PhishApp.EmailSender.Services;
using PhishApp.EmailSender.Services.Interfaces;
using PhishApp.WebApi.Infrastructure;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Repositories;
using PhishApp.WebApi.Repositories.Interfaces;
using PhishApp.WebApi.Services;
using PhishApp.WebApi.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PhishApp.EmailSender.Infrastructure
{
    internal class EmailSenderInjectionModule
    {
        public static void ConfigureServices(IServiceCollection services, ConfigurationManager configuration)
        {
            services.AddTransient<IEmailSenderService, EmailSenderService>();
            services.AddTransient<IAppLoggService, AppLoggService>();

            services.AddLogging(builder =>
            {
                builder.ClearProviders();
                builder.SetMinimumLevel(LogLevel.Trace);
                builder.AddNLog("NLog.config");
            });
        }
    }
}
