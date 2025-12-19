using Microsoft.EntityFrameworkCore;
using PhishApp.WebApi.Infrastructure;
using PhishApp.WebApi.Models.Identity;
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
                throw new KeyNotFoundException($"Quiz o Id {quizId} nie zostal znaleziony.");
            }

            _context.Quizzes.Remove(quiz);
            await _context.SaveChangesAsync();
        }

        public async Task<QuizEntity?> GetQuizAsync(int quizId)
        {
            return await _context.Quizzes
                .Include(q => q.Questions)
                    .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == quizId);
        }

        public Task<QuizEntity> AddQuizAsync(QuizEntity quiz)
        {
            _context.Quizzes.Add(quiz);
            return Task.FromResult(quiz);
        }

        public async Task<QuizEntity> UpdateQuizAsync(QuizEntity quiz)
        {
            var existing = await _context.Quizzes
                .Include(q => q.Questions)
                    .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == quiz.Id);

            if (existing == null)
            {
                throw new KeyNotFoundException($"Quiz o Id {quiz.Id} nie zostal znaleziony.");
            }

            existing.Title = quiz.Title;
            existing.Description = quiz.Description;

            var incomingIds = quiz.Questions.Where(q => q.Id > 0).Select(q => q.Id).ToHashSet();
            var toRemove = existing.Questions.Where(q => !incomingIds.Contains(q.Id)).ToList();
            _context.Questions.RemoveRange(toRemove);

            foreach (var newQuestion in quiz.Questions)
            {
                if (newQuestion.Id > 0)
                {
                    var target = existing.Questions.First(q => q.Id == newQuestion.Id);
                    target.Text = newQuestion.Text;
                    target.Type = newQuestion.Type;
                    target.CorrectAnswerValue = newQuestion.CorrectAnswerValue;
                    target.CorrectAnswer = null;
                    target.CorrectAnswerId = null;

                    _context.Answers.RemoveRange(target.Answers);
                    target.Answers.Clear();

                    if (newQuestion.Type != Models.Quizzes.QuestionType.TrueFalse)
                    {
                        foreach (var ans in newQuestion.Answers)
                        {
                            target.Answers.Add(new AnswerEntity { Text = ans.Text });
                        }
                    }
                }
                else
                {
                    newQuestion.CorrectAnswer = null;
                    newQuestion.CorrectAnswerId = null;
                    newQuestion.Quiz = existing;
                    newQuestion.QuizId = existing.Id;
                    existing.Questions.Add(newQuestion);
                }
            }

            return existing;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}

