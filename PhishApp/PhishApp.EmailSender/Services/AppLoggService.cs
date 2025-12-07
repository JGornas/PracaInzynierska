using NLog;
using PhishApp.EmailSender.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PhishApp.EmailSender.Services
{
    public class AppLoggService : IAppLoggService
    {
        private static readonly Logger logger = LogManager.GetCurrentClassLogger();

        public void Info(string message) => logger.Info(message);

        public void Warn(string message) => logger.Warn(message);

        public void Error(string message, Exception? ex = null) =>
            logger.Error(ex, message);
    }
}
