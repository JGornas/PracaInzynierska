using PhishApp.WebApi.Models.Quizzes;

namespace PhishApp.WebApi.Models.Quizzes
{
    public class QuizDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<QuestionDto> Questions { get; set; } = new();
    }

    public class QuizPayload
    {
        public int? Id { get; set; }
        public string Name { get; set; } = string.Empty; // alias dla Title z frontu
        public string? Title { get; set; }
        public string? Description { get; set; }
        public List<QuestionDto> Questions { get; set; } = new();
    }

    public class QuestionDto
    {
        public int? Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public QuestionType Type { get; set; }
        public List<AnswerDto>? Options { get; set; }
        public string? CorrectAnswer { get; set; }
        public bool? CorrectAnswerValue { get; set; }
    }

    public class AnswerDto
    {
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }
}
