using System.ComponentModel.DataAnnotations.Schema;

namespace PhishApp.WebApi.Models.Rows
{
    [Table("QuizRows")]
    public class QuizRow
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
