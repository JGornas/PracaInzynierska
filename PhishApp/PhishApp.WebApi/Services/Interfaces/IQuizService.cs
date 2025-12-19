using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Rows;
using PhishApp.WebApi.Models.Quizzes;

namespace PhishApp.WebApi.Services.Interfaces
{
    public interface IQuizService
    {
        Task DeleteQuizz(int id);
        Task<GridData<QuizRow>?> GetTemplatesGridData(GridRequest request);
        Task<QuizDto> GetQuizAsync(int id);
        Task<QuizDto> SaveQuizAsync(QuizPayload payload);
    }
}

