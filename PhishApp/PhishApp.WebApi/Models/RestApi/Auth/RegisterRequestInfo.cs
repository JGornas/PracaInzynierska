using Newtonsoft.Json;

namespace PhishApp.WebApi.Models.RestApi.Auth
{
    public class RegisterRequestInfo
    {
        [JsonProperty("email")]
        public string Email { get; set; } = string.Empty;
    }
}
