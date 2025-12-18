namespace PhishApp.WebApi.Models.Identity
{

    public class AnswerEntity
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;

        public int QuestionId { get; set; }
        public QuestionEntity Question { get; set; } = null!;
    }
}
