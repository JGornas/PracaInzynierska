using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace PhishApp.WebApi.Models.Templates
{
    public class Template
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Subject { get; set; } = string.Empty;

        public string Content { get; set; } = string.Empty;

        public object? DesignObject { get; set; }

        [JsonIgnore]
        public string DesignObjectJson => DesignObject is not null ? JsonSerializer.Serialize(DesignObject) : String.Empty;
    }
}
