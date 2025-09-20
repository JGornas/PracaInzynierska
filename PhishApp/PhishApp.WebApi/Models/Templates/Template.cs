using System.ComponentModel.DataAnnotations;

namespace PhishApp.WebApi.Models.Templates
{
    public class Template
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Subject { get; set; } = string.Empty;

        public string Content { get; set; } = string.Empty;

        public string DesignObject { get; set; } = string.Empty;
    }
}
