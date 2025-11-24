using System.ComponentModel.DataAnnotations.Schema;

namespace PhishApp.WebApi.Models.Rows
{
    [Table("RecipientGroupRows")]
    public class RecipientGroupRow
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
