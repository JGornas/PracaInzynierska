using MailKit.Security;
using MimeKit;
using PhishApp.WebApi.Models.SendingProfiles;
using PhishApp.WebApi.Services.Interfaces;
using MailKit.Net.Smtp;

namespace PhishApp.WebApi.Services
{
    public class EmailSendingService : IEmailSendingService
    {
        public async Task SendMailAsync(
            SendingProfile profile,
            string? recipientEmail,
            string subject,
            string body,
            bool isHtml = true)
        {

            if (string.IsNullOrEmpty(recipientEmail)) throw new Exception("Nie podano testowego adresu email odbiorcy");

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(profile.SenderName, profile.SenderEmail));
            message.To.Add(new MailboxAddress("", recipientEmail));
            message.Subject = subject;

            if (!string.IsNullOrEmpty(profile.ReplyTo))
                message.ReplyTo.Add(new MailboxAddress("", profile.ReplyTo));

            var builder = new BodyBuilder();
            if (isHtml)
                builder.HtmlBody = body;
            else
                builder.TextBody = body;

            message.Body = builder.ToMessageBody();

            var secureOption = profile.UseSsl
                ? SecureSocketOptions.StartTls
                : SecureSocketOptions.None;

            using var client = new SmtpClient();

            
            await client.ConnectAsync(profile.Host, profile.Port, secureOption);

            if (!string.IsNullOrEmpty(profile.Username))
                await client.AuthenticateAsync(profile.Username, profile.Password);

            await client.SendAsync(message);
            await client.DisconnectAsync(true);

        }

        
    }
}
