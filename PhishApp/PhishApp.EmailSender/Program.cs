using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PhishApp.WebApi.Infrastructure;
using PhishApp.EmailSender.Infrastructure;
using PhishApp.EmailSender.Services.Interfaces;

namespace PhishApp.EmailSender;

internal class Program
{
    static void Main(string[] args)
    {
        var configuration = new ConfigurationManager();
        configuration.SetBasePath(Directory.GetCurrentDirectory());
        configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

        var services = new ServiceCollection();

        InjectionModule.ConfigureServices(services, configuration);

        EmailSenderInjectionModule.ConfigureServices(services, configuration);

        var provider = services.BuildServiceProvider();

        var emailSender = provider.GetRequiredService<IEmailSenderService>();

        emailSender.Start();
    }
}
