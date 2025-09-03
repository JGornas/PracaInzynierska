using Microsoft.AspNetCore.Identity;

namespace PhishApp.WebApi.Models.Identity
{
    public class ApplicationUserToken : IdentityUserToken<int>
    {
        public DateTime? ExpirationTime { get; set; }
    }
}
