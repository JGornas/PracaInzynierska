using PhishApp.WebApi.Helpers;

namespace PhishApp.WebApi.Models
{
    public class RestResponse<T>
    {
        public T? Data { get; set; }
        public bool IsSuccess { get; set; }
        public string? ErrorMessage { get; set; }

        public RestResponse()
        {
        }

        public static RestResponse<T> CreateSuccessResponse(T data)
        {
            return new RestResponse<T>
            {
                Data = data,
                IsSuccess = true
            };
        }

        public static RestResponse<T> CreateErrorResponse(Exception exception)
        {
            return new RestResponse<T>
            {
                IsSuccess = false,
                ErrorMessage = ExceptionHelper.BuildMessage(exception)
            };
        }
    }
}
