using PhishApp.WebApi.Models.Grid;

namespace PhishApp.WebApi.Services.Interfaces
{
    public interface IGridService
    {
        Task<GridData<T>> GetGridData<T>(GridRequest request) where T : class;
    }
}
