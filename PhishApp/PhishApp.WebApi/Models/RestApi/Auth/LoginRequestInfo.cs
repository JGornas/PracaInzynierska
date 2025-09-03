using Newtonsoft.Json;

namespace PhishApp.WebApi.Models.RestApi.Auth
{
   

    public class LoginRequestInfo
    {
        [JsonProperty("email")]
        public string Email { get; set; } = string.Empty;

        [JsonProperty("password")]
        public string Password { get; set; } = string.Empty;
    }
}
