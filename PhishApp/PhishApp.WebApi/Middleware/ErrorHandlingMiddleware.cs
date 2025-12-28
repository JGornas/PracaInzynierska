using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Models.RestApi;
using System;

namespace PhishApp.WebApi.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;

        public ErrorHandlingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            int statusCode = ExceptionHelper.GetErrorStatusCode(ex);

            var errorMessage = ExceptionHelper.BuildMessage(ex);
            Console.WriteLine(errorMessage);
            var response = RestResponse<string>.CreateResponse(errorMessage);


            context.Response.ContentType = "application/json";
            context.Response.StatusCode = statusCode;

            return context.Response.WriteAsJsonAsync(response);
        }
    }

}
