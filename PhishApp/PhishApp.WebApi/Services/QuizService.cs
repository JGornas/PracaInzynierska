using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.Quizzes;
using PhishApp.WebApi.Models.Recipients;
using PhishApp.WebApi.Models.RestApi.Quizzes;
using PhishApp.WebApi.Models.Rows;
using PhishApp.WebApi.Repositories.Interfaces;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Services
{
    public class QuizService : IQuizService
    {
        private readonly IGridService _gridService;
        private readonly IQuizzRepository _quizzRepository;
        private readonly IEmailSendingService _emailSendingService;
        private readonly IRecipientService _recipientService;
        private readonly ISendingProfileService _sendingProfileService;
        private readonly ITemplateService _templateService;


        public QuizService(IGridService gridService, IQuizzRepository quizzRepository, IEmailSendingService emailSendingService, IRecipientService recipientService, ISendingProfileService sendingProfileService, ITemplateService templateService)
        {
            _gridService = gridService;
            _quizzRepository = quizzRepository;
            _emailSendingService = emailSendingService;
            _recipientService = recipientService;
            _sendingProfileService = sendingProfileService;
            _templateService = templateService;
        }


        public async Task<bool> SendQuizEmails(SendQuizzRequestInfo requestInfo)
        {
            var quizz = await GetQuizAsync(requestInfo.QuizzId);
            var sendingProfile = await _sendingProfileService.GetProfileAsync(requestInfo.SendingProfileId);
            var template = await _templateService.GetTemplate(requestInfo.TemplateId);

            var recipientGroups = new List<RecipientGroup>();

            foreach(var groupId in requestInfo.RecipientGroupIds)
            {
                var group = await _recipientService.GetGroupByIdAsync(groupId);
                if (group != null)
                {
                    recipientGroups.Add(group);
                }
            }

            foreach (var group in recipientGroups)
            {
                foreach (var member in group.Members)
                {
                    var body = HtmlHelper.AddQuizRedirects(template.Content, quizz.Id);
                    var recipient = member;
                    var subject = template.Subject;

                    await _emailSendingService.SendMailAsync(sendingProfile, recipient.Email, subject, body);
                }
            }


            return true;
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
                throw new KeyNotFoundException($"Quiz o Id {id} nie zostal znaleziony.");
            }
            return MapToDto(quiz);
        }

        public async Task<QuizDto> SaveQuizAsync(QuizPayload payload)
        {
            if (string.IsNullOrWhiteSpace(payload.Name) && string.IsNullOrWhiteSpace(payload.Title))
            {
                throw new ArgumentException("Quiz wymaga nazwy/tytulu.");
            }

            var title = payload.Name?.Trim() ?? payload.Title?.Trim() ?? string.Empty;

            var isUpdate = payload.Id.HasValue && payload.Id > 0;
            var existing = isUpdate
                ? await _quizzRepository.GetQuizAsync(payload.Id!.Value) ?? throw new KeyNotFoundException($"Quiz o Id {payload.Id} nie zostal znaleziony.")
                : new QuizEntity();

            var mappedQuiz = new QuizEntity
            {
                Id = existing.Id,
                Title = title,
                Description = payload.Description?.Trim() ?? string.Empty
            };

            var correctAnswers = new Dictionary<QuestionEntity, string?>();
            mappedQuiz.Questions = MapQuestions(payload.Questions, mappedQuiz, correctAnswers);

            var persisted = isUpdate
                ? await _quizzRepository.UpdateQuizAsync(mappedQuiz)
                : await _quizzRepository.AddQuizAsync(mappedQuiz);

            await _quizzRepository.SaveChangesAsync();

            ApplyCorrectAnswers(persisted, correctAnswers);
            await _quizzRepository.SaveChangesAsync();

            return MapToDto(persisted);
        }

        private List<QuestionEntity> MapQuestions(IEnumerable<QuestionDto> questions, QuizEntity quiz, Dictionary<QuestionEntity, string?> correctAnswerMap)
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
                    correctAnswerMap[question] = null;
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
                    question.CorrectAnswerValue = null;
                    correctAnswerMap[question] = (q.CorrectAnswer ?? string.Empty).ToUpperInvariant();
                }
                result.Add(question);
            }
            return result;
        }

        private void ApplyCorrectAnswers(QuizEntity quiz, Dictionary<QuestionEntity, string?> correctAnswerMap)
        {
            if (!correctAnswerMap.Any()) return;

            var trackedQuestions = quiz.Questions?.ToList() ?? new List<QuestionEntity>();

            foreach (var kvp in correctAnswerMap)
            {
                var sourceQuestion = kvp.Key;
                var correctKey = kvp.Value;

                var target = sourceQuestion.Id > 0
                    ? trackedQuestions.FirstOrDefault(q => q.Id == sourceQuestion.Id)
                    : trackedQuestions.FirstOrDefault(q => ReferenceEquals(q, sourceQuestion)) ?? sourceQuestion;

                if (target == null) continue;

                if (target.Type == QuestionType.TrueFalse)
                {
                    target.CorrectAnswer = null;
                    target.CorrectAnswerId = null;
                    continue;
                }

                var answers = target.Answers?.ToList() ?? new List<AnswerEntity>();
                var orderedKeys = new[] { "A", "B", "C", "D" };
                var index = Array.IndexOf(orderedKeys, correctKey);
                if (index >= 0 && index < answers.Count)
                {
                    var answer = answers[index];
                    target.CorrectAnswerId = answer.Id;
                    target.CorrectAnswer = answer;
                }
            }
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


