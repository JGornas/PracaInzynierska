using Microsoft.AspNetCore.Identity;

namespace PhishApp.WebApi.Models.Identity
{
    public class ApplicationUser : IdentityUser
    {
        public bool IsPasswordSet { get; set; } = false;
        public string ActivationKey { get; set; } = string.Empty;
    }
}
