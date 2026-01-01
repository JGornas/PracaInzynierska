using PhishApp.WebApi.Models.Identity;

namespace PhishApp.WebApi.Repositories.Interfaces
{
    public interface IRecipientRepository
    {
        Task<RecipientEntity?> GetRecipientByIdAsync(int id);
        Task<RecipientEntity?> GetRecipientByEmailAsync(string email);
        Task<RecipientEntity> AddRecipientAsync(RecipientEntity recipient);
        Task<RecipientEntity> UpdateRecipientAsync(RecipientEntity recipient);

        Task<IReadOnlyCollection<RecipientGroupEntity>> GetGroupsAsync();
        Task<RecipientGroupEntity?> GetGroupByIdAsync(int id);
        Task<RecipientGroupEntity> AddGroupAsync(RecipientGroupEntity group, IEnumerable<int> memberRecipientIds);
        Task<RecipientGroupEntity> UpdateGroupAsync(int id, RecipientGroupEntity group, IEnumerable<int> memberRecipientIds);
        Task DeleteGroupAsync(int id);
    }
}
