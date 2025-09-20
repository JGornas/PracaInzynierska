namespace PhishApp.WebApi.Helpers
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
    }
}
