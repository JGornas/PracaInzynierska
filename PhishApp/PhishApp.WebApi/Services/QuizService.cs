using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.Quizzes;
using PhishApp.WebApi.Models.Rows;
using PhishApp.WebApi.Repositories.Interfaces;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Services
{
    public class QuizService : IQuizService
    {
        private readonly IGridService _gridService;
        private readonly IQuizzRepository _quizzRepository;

        public QuizService(IGridService gridService, IQuizzRepository quizzRepository)
        {
            _gridService = gridService;
            _quizzRepository = quizzRepository;
        }

        public async Task DeleteQuizz(int id)
        {
            await _quizzRepository.DeleteQuizAsync(id);
        }

        public async Task<GridData<QuizRow>?> GetTemplatesGridData(GridRequest request)
        {
            return await _gridService.GetGridData<QuizRow>(request);
        }

        public async Task<QuizDto> GetQuizAsync(int id)
        {
            var quiz = await _quizzRepository.GetQuizAsync(id);
            if (quiz == null)
            {
                throw new KeyNotFoundException($"Quiz o Id {id} nie został znaleziony.");
            }
            return MapToDto(quiz);
        }

        public async Task<QuizDto> SaveQuizAsync(QuizPayload payload)
        {
            if (string.IsNullOrWhiteSpace(payload.Name) && string.IsNullOrWhiteSpace(payload.Title))
            {
                throw new ArgumentException("Quiz wymaga nazwy/tytułu.");
            }

            var title = payload.Name?.Trim() ?? payload.Title?.Trim() ?? string.Empty;

            var entity = payload.Id.HasValue
                ? await _quizzRepository.GetQuizAsync(payload.Id.Value) ?? new QuizEntity()
                : new QuizEntity();

            entity.Title = title;
            entity.Description = payload.Description?.Trim() ?? string.Empty;

            entity.Questions = MapQuestions(payload.Questions, entity);

            if (payload.Id.HasValue && entity.Id > 0)
            {
                entity = await _quizzRepository.UpdateQuizAsync(entity);
            }
            else
            {
                entity = await _quizzRepository.AddQuizAsync(entity);
            }

            return MapToDto(entity);
        }

        private List<QuestionEntity> MapQuestions(IEnumerable<QuestionDto> questions, QuizEntity quiz)
        {
            var result = new List<QuestionEntity>();
            foreach (var q in questions)
            {
                var type = ParseType(q.Type);
                var question = new QuestionEntity
                {
                    Id = q.Id ?? 0,
                    Text = q.Text,
                    Type = type,
                    Quiz = quiz,
                    QuizId = quiz.Id
                };

                if (type == QuestionType.TrueFalse)
                {
                    question.CorrectAnswerValue = q.CorrectAnswerValue;
                    question.CorrectAnswerId = null;
                    question.Answers = new List<AnswerEntity>();
                }
                else
                {
                    var orderedKeys = new[] { "A", "B", "C", "D" };
                    var answers = orderedKeys.Select(k =>
                    {
                        var opt = (q.Options ?? new List<AnswerDto>()).FirstOrDefault(o => string.Equals(o.Key, k, StringComparison.OrdinalIgnoreCase));
                        return new AnswerEntity
                        {
                            Id = 0,
                            Text = opt?.Value ?? string.Empty
                        };
                    }).ToList();

                    question.Answers = answers;
                    var correctKey = (q.CorrectAnswer ?? string.Empty).ToUpperInvariant();
                    var index = Array.IndexOf(orderedKeys, correctKey);
                    if (index >= 0 && index < answers.Count)
                    {
                        question.CorrectAnswer = answers[index];
                    }
                    question.CorrectAnswerValue = null;
                }
                result.Add(question);
            }
            return result;
        }

        private QuizDto MapToDto(QuizEntity entity)
        {
            return new QuizDto
            {
                Id = entity.Id,
                Title = entity.Title,
                Description = entity.Description,
                Questions = entity.Questions?.Select(q => new QuestionDto
                {
                    Id = q.Id,
                    Text = q.Text,
                    Type = q.Type == QuestionType.TrueFalse ? "TRUE_FALSE" : "ABCD",
                    CorrectAnswer = q.Type == QuestionType.TrueFalse ? null : MapCorrectAnswerKey(q),
                    CorrectAnswerValue = q.Type == QuestionType.TrueFalse ? q.CorrectAnswerValue : null,
                    Options = q.Type == QuestionType.TrueFalse
                        ? null
                        : q.Answers?.Select((a, idx) => new AnswerDto { Key = MapKey(idx), Value = a.Text }).ToList()
                }).ToList() ?? new List<QuestionDto>()
            };
        }

        private static string MapKey(int idx) => idx switch
        {
            0 => "A",
            1 => "B",
            2 => "C",
            3 => "D",
            _ => string.Empty
        };

        private static string? MapCorrectAnswerKey(QuestionEntity question)
        {
            if (question.CorrectAnswer == null || question.Answers == null) return null;
            var answers = question.Answers.ToList();
            var index = answers.FindIndex(a => a.Id == question.CorrectAnswer.Id);
            return MapKey(index);
        }

        private static QuestionType ParseType(string type)
        {
            return type?.ToUpperInvariant() switch
            {
                "TRUE_FALSE" => QuestionType.TrueFalse,
                _ => QuestionType.SingleChoice
            };
        }
    }
}
