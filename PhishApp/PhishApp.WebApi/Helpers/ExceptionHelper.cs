using System.Text;

namespace PhishApp.WebApi.Helpers
{
    public class ExceptionHelper
    {
        public static string BuildMessage(Exception exception)
        {
            var exceptionMessageBuilder = new StringBuilder();

            exceptionMessageBuilder.Append(exception.Message);

            var innerException = exception.InnerException;

            while (!(innerException is null))
            {
                exceptionMessageBuilder.Append(" | ");
                exceptionMessageBuilder.Append(innerException.Message);

                innerException = innerException.InnerException;
            }

            return exceptionMessageBuilder.ToString();
        }

        public static int GetErrorStatusCode(Exception exception)
        {
            return exception switch
            {
                ArgumentNullException => StatusCodes.Status400BadRequest,
                UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
                KeyNotFoundException => StatusCodes.Status404NotFound,
                _ => StatusCodes.Status500InternalServerError
            };
        }
    }
}
