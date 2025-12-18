namespace PhishApp.WebApi.Models.Identity
{
    public class QuizEntity
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public ICollection<QuestionEntity> Questions { get; set; } = new List<QuestionEntity>();
    }
}
