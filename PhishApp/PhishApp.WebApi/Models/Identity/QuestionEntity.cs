using PhishApp.WebApi.Models.Quizzes;

namespace PhishApp.WebApi.Models.Identity
{
    public class QuestionEntity
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public QuestionType Type { get; set; }

        public int QuizId { get; set; }
        public QuizEntity Quiz { get; set; } = null!;

        public ICollection<AnswerEntity> Answers { get; set; } = new List<AnswerEntity>();

        public int? CorrectAnswerId { get; set; }
        public AnswerEntity? CorrectAnswer { get; set; }

        public bool? CorrectAnswerValue { get; set; }
    }
}
