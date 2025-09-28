﻿namespace PhishApp.WebApi.Helpers
{
    public class Routes
    {
        public const string Ping = "api/ping";
        public const string PingError = "api/pingError";

        public const string Login = "api/auth/login";
        public const string SetPassword = "api/auth/setPassword";
        public const string Register = "api/auth/register";
        public const string RefreshAccessToken = "api/auth/refresh";
        public const string Logout = "api/auth/logout";

        public const string TemplatesGrid = "api/templates/grid";
        public const string UpdateTemplate= "api/templates/update";
        public const string GetTemplate= "api/templates/{id}";
        public const string DeleteTemplate= "api/templates/{id}";

        public const string GetRecipients = "api/recipients/individuals";
        public const string CreateRecipient = "api/recipients/individuals";
        public const string UpdateRecipient = "api/recipients/individuals/{id}";
        public const string DeleteRecipient = "api/recipients/individuals/{id}";

        public const string GetRecipientGroups = "api/recipients/groups";
        public const string CreateRecipientGroup = "api/recipients/groups";
        public const string UpdateRecipientGroup = "api/recipients/groups/{id}";
        public const string DeleteRecipientGroup = "api/recipients/groups/{id}";

        public const string LandingPagesGrid = "api/landingPages/grid";
        public const string DeleteLandingPage= "api/landingPages/{id}";
        public const string UpdateLandingPage= "api/landingPages/update";
        public const string GetLandingPage = "api/landingPages/{id}";
    }
}
