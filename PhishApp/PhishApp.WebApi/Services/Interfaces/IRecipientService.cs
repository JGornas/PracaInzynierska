using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Recipients;
using PhishApp.WebApi.Models.Rows;

namespace PhishApp.WebApi.Services.Interfaces
{
    public interface IRecipientService
    {
        Task<IReadOnlyCollection<RecipientGroup>> GetGroupsAsync();
        Task<RecipientGroup> CreateGroupAsync(RecipientGroup group);
        Task<RecipientGroup> UpdateGroupAsync(int id, RecipientGroup group);
        Task DeleteGroupAsync(int id);
        Task<GridData<RecipientGroupRow>> GetRecipientGroupGridData(GridRequest request);
        Task<RecipientGroup?> GetGroupByIdAsync(int id);
    }
}
