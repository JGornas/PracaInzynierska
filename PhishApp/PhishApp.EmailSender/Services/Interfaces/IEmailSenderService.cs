using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PhishApp.EmailSender.Services.Interfaces
{
    public interface IEmailSenderService
    {
        public Task Start();
    }
}
