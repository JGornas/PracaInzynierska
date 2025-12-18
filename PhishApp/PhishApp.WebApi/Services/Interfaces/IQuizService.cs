using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Rows;

namespace PhishApp.WebApi.Services.Interfaces
{
    public interface IQuizService
    {
        Task DeleteQuizz(int id);
        Task<GridData<QuizRow>?> GetTemplatesGridData(GridRequest request);
    }
}
