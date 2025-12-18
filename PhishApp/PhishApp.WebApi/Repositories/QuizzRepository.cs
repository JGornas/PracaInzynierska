using Microsoft.EntityFrameworkCore;
using PhishApp.WebApi.Infrastructure;
using PhishApp.WebApi.Repositories.Interfaces;

namespace PhishApp.WebApi.Repositories
{
    public class QuizzRepository : IQuizzRepository
    {
        private readonly DataContext _context;

        public QuizzRepository(DataContext context)
        {
            _context = context;
        }

        public async Task DeleteQuizAsync(int quizId)
        {
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                    .ThenInclude(qt => qt.Answers)
                .FirstOrDefaultAsync(q => q.Id == quizId);

            if (quiz == null)
            {
                throw new KeyNotFoundException($"Quiz o Id {quizId} nie został znaleziony.");
            }

            _context.Quizzes.Remove(quiz);

            await _context.SaveChangesAsync();
        }

    }
}
