using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PhishApp.EmailSender.Services.Interfaces
{
    public interface IAppLoggService
    {
        void Error(string message, Exception? ex = null);
        void Info(string message);
        void Warn(string message);
    }
}
