using PhishApp.WebApi.Models.SendingProfiles;

namespace PhishApp.WebApi.Repositories.Interfaces
{
    public interface ISendingProfileRepository
    {
        Task<IReadOnlyCollection<SendingProfileEntity>> GetProfilesAsync();
        Task<SendingProfileEntity?> GetByIdAsync(int id);
        Task<SendingProfileEntity?> GetByNameAsync(string name);
        Task<SendingProfileEntity> AddAsync(SendingProfileEntity entity);
        Task<SendingProfileEntity> UpdateAsync(SendingProfileEntity entity);
        Task DeleteAsync(int id);
    }
}
