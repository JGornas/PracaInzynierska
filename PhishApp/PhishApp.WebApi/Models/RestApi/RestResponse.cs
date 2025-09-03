namespace PhishApp.WebApi.Models.RestApi
{
    public class RestResponse<T>
    {
        public T? Data { get; set; }
        public static RestResponse<T> CreateResponse(T? data)
        {
            return new RestResponse<T>
            {
                Data = data
            };
        }
    }
}
