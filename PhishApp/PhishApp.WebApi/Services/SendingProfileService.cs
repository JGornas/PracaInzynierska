using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.SendingProfiles;
using PhishApp.WebApi.Repositories.Interfaces;
using PhishApp.WebApi.Services.Interfaces;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Net;
using System.Net.Mail;

namespace PhishApp.WebApi.Services
{
    public class SendingProfileService : ISendingProfileService
    {
        private static readonly ReadOnlyCollection<string> SupportedProtocols =
            Array.AsReadOnly(new[] { "SMTP" });

        private readonly ISendingProfileRepository _sendingProfileRepository;
        private readonly IEmailSendingService _emailSendingService;
        private readonly ITemplateService _templateService;

        public SendingProfileService(ISendingProfileRepository sendingProfileRepository, IEmailSendingService emailSendingService, ITemplateService templateService)
        {
            _sendingProfileRepository = sendingProfileRepository;
            _emailSendingService = emailSendingService;
            _templateService = templateService;
        }

        public async Task<IReadOnlyCollection<SendingProfile>> GetProfilesAsync()
        {
            var entities = await _sendingProfileRepository.GetProfilesAsync();
            return entities.Select(MapEntityToModel).ToList();
        }

        public async Task<SendingProfile> GetProfileAsync(int id)
        {
            var entity = await _sendingProfileRepository.GetByIdAsync(id)
                ?? throw new InvalidOperationException($"Sending profile with id {id} was not found");

            return MapEntityToModel(entity);
        }

        public async Task<SendingProfile> CreateProfileAsync(SendingProfile profile)
        {
            var normalized = Normalize(profile, requirePassword: true);
            var existingByName = await _sendingProfileRepository.GetByNameAsync(normalized.Name);
            if (existingByName is not null)
            {
                throw new InvalidOperationException($"Profile with name '{normalized.Name}' already exists.");
            }

            var entity = BuildEntity(normalized, new SendingProfileEntity());
            entity.Password = normalized.Password!;

            var saved = await _sendingProfileRepository.AddAsync(entity);
            return MapEntityToModel(saved);
        }

        public async Task<SendingProfile> UpdateProfileAsync(int id, SendingProfile profile)
        {
            var entity = await _sendingProfileRepository.GetByIdAsync(id)
                ?? throw new InvalidOperationException($"Sending profile with id {id} was not found");

            profile.Id = id;
            var normalized = Normalize(profile, requirePassword: false);

            var duplicate = await _sendingProfileRepository.GetByNameAsync(normalized.Name);
            if (duplicate is not null && duplicate.Id != id)
            {
                throw new InvalidOperationException($"Profile with name '{normalized.Name}' already exists.");
            }

            BuildEntity(normalized, entity);
            if (!string.IsNullOrEmpty(normalized.Password))
            {
                entity.Password = normalized.Password!;
            }

            var saved = await _sendingProfileRepository.UpdateAsync(entity);
            return MapEntityToModel(saved);
        }

        public async Task DeleteProfileAsync(int id)
        {
            await _sendingProfileRepository.DeleteAsync(id);
        }

        public async Task SendOneTimeEmail(int id)
        {
            var sendingProfile = await GetProfileAsync(id);

            var recipientEmail = sendingProfile.TestEmail;

            var subject = "Test wiadomości";
            var body = "<b>Cześć!</b> To jest testowy e-mail.";

            await _emailSendingService.SendMailAsync(sendingProfile, recipientEmail, subject, body);
        }

        

        private static SendingProfile MapEntityToModel(SendingProfileEntity entity)
        {
            return new SendingProfile
            {
                Id = entity.Id,
                Name = entity.Name,
                Protocol = entity.Protocol,
                SenderName = entity.SenderName,
                SenderEmail = entity.SenderEmail,
                Host = entity.Host,
                Port = entity.Port,
                Username = entity.Username,
                Password = entity.Password,
                UseSsl = entity.UseSsl,
                ReplyTo = entity.ReplyTo,
                HasPassword = !string.IsNullOrEmpty(entity.Password),
                TestEmail = entity.TestEmail
            };
        }

        private static SendingProfileEntity BuildEntity(SendingProfile model, SendingProfileEntity destination)
        {
            destination.Name = model.Name;
            destination.Protocol = model.Protocol;
            destination.SenderName = model.SenderName;
            destination.SenderEmail = model.SenderEmail;
            destination.Host = model.Host;
            destination.Port = model.Port;
            destination.Username = model.Username;
            destination.UseSsl = model.UseSsl;
            destination.ReplyTo = model.ReplyTo;
            destination.UpdatedAt = DateTime.Now;
            destination.TestEmail = model.TestEmail;
            return destination;
        }

        private static SendingProfile Normalize(SendingProfile? profile, bool requirePassword)
        {
            if (profile is null)
            {
                throw new ArgumentNullException(nameof(profile));
            }

            profile.Name = NormalizeRequired(profile.Name, nameof(profile.Name));
            profile.Protocol = NormalizeProtocol(profile.Protocol);
            profile.SenderName = NormalizeRequired(profile.SenderName, nameof(profile.SenderName));
            profile.SenderEmail = NormalizeRequired(profile.SenderEmail, nameof(profile.SenderEmail)).ToLowerInvariant();
            ValidateEmail(profile.SenderEmail, nameof(profile.SenderEmail));

            profile.Host = NormalizeRequired(profile.Host, nameof(profile.Host));

            if (profile.Port <= 0 || profile.Port > 65535)
            {
                throw new ArgumentOutOfRangeException(nameof(profile.Port), "Port must be between 1 and 65535");
            }

            profile.Username = NormalizeRequired(profile.Username, nameof(profile.Username));

            profile.Password = NormalizeOptional(profile.Password);
            if (requirePassword && string.IsNullOrEmpty(profile.Password))
            {
                throw new ArgumentException("Password must be provided", nameof(profile.Password));
            }

            profile.ReplyTo = NormalizeOptional(profile.ReplyTo);
            profile.TestEmail = NormalizeOptional(profile.TestEmail);
            if (!string.IsNullOrEmpty(profile.ReplyTo))
            {
                ValidateEmail(profile.ReplyTo, nameof(profile.ReplyTo));
            }

            profile.HasPassword = !string.IsNullOrEmpty(profile.Password);

            return profile;
        }

        private static string NormalizeProtocol(string? protocol)
        {
            var normalized = string.IsNullOrWhiteSpace(protocol)
                ? "SMTP"
                : protocol.Trim().ToUpperInvariant();

            if (!SupportedProtocols.Contains(normalized))
            {
                throw new ArgumentException($"Unsupported protocol '{normalized}'.", nameof(protocol));
            }

            return normalized;
        }

        private static string NormalizeRequired(string? value, string fieldName)
        {
            var normalized = NormalizeOptional(value);
            if (string.IsNullOrEmpty(normalized))
            {
                throw new ArgumentException($"{fieldName} is required", fieldName);
            }

            return normalized;
        }

        private static string? NormalizeOptional(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            return value.Trim();
        }

        private static void ValidateEmail(string? email, string fieldName)
        {
            try
            {
                _ = new MailAddress(email ?? string.Empty);
            }
            catch (FormatException)
            {
                throw new ArgumentException($"Field {fieldName} must contain a valid email address", fieldName);
            }
        }
    }
}
