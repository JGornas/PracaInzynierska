using PhishApp.WebApi.Exceptions;
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
                InvalidOperationException => StatusCodes.Status403Forbidden,
                KeyNotFoundException => StatusCodes.Status404NotFound,
                InvalidCredentialsException => StatusCodes.Status422UnprocessableEntity,
                _ => StatusCodes.Status500InternalServerError
            };
        }
    }
}
