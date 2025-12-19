using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.Quizzes;

namespace PhishApp.WebApi.Repositories.Interfaces
{
    public interface IQuizzRepository
    {
        Task DeleteQuizAsync(int quizId);
        Task<QuizEntity?> GetQuizAsync(int quizId);
        Task<QuizEntity> AddQuizAsync(QuizEntity quiz);
        Task<QuizEntity> UpdateQuizAsync(QuizEntity quiz);
        Task SaveChangesAsync();
    }
}
