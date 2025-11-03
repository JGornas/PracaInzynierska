using PhishApp.WebApi.Models.Identity;

namespace PhishApp.WebApi.Repositories.Interfaces
{
    public interface IRecipientRepository
    {
        Task<IReadOnlyCollection<RecipientEntity>> GetRecipientsAsync();
        Task<RecipientEntity?> GetRecipientByIdAsync(int id);
        Task<RecipientEntity?> GetRecipientByEmailAsync(string email);
        Task<RecipientEntity> AddRecipientAsync(RecipientEntity recipient);
        Task<RecipientEntity> UpdateRecipientAsync(RecipientEntity recipient);
        Task DeleteRecipientAsync(int id);

        Task<IReadOnlyCollection<RecipientGroupEntity>> GetGroupsAsync();
        Task<RecipientGroupEntity?> GetGroupByIdAsync(int id);
        Task<RecipientGroupEntity> AddGroupAsync(RecipientGroupEntity group, IEnumerable<int> memberRecipientIds);
        Task<RecipientGroupEntity> UpdateGroupAsync(int id, RecipientGroupEntity group, IEnumerable<int> memberRecipientIds);
        Task DeleteGroupAsync(int id);
    }
}
