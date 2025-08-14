using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Services
{
    public class TestService : ITestService
    {
        public string GetMessage()
        {
            return "Pong";
        }
        public string GetMessageError()
        {
            throw new UnauthorizedAccessException("Pąng");
        }
    }
}
