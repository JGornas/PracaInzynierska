using PhishApp.WebApi.Models.SendingProfiles;

namespace PhishApp.WebApi.Services.Interfaces
{
    public interface ISendingProfileService
    {
        Task<IReadOnlyCollection<SendingProfile>> GetProfilesAsync();
        Task<SendingProfile> GetProfileAsync(int id);
        Task<SendingProfile> CreateProfileAsync(SendingProfile profile);
        Task<SendingProfile> UpdateProfileAsync(int id, SendingProfile profile);
        Task DeleteProfileAsync(int id);
        Task SendOneTimeEmail(int id);
    }
}
