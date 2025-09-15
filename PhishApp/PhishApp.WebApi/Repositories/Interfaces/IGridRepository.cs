using PhishApp.WebApi.Models.Grid;

namespace PhishApp.WebApi.Repositories.Interfaces
{
    public interface IGridRepository
    {
        Task<GridData<T>> GetGridData<T>(GridRequest request) where T : class;
    }
}
