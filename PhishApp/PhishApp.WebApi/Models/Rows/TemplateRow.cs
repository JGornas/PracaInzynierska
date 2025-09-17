using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhishApp.WebApi.Models.Rows
{
    [Table("TemplateRows")]
    public class TemplateRow
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Subject { get; set; } = string.Empty;

        public string Content { get; set; } = string.Empty;
    }
}
