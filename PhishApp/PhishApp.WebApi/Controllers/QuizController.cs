using Microsoft.AspNetCore.Mvc;
using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.RestApi;
using PhishApp.WebApi.Models.Rows;
using PhishApp.WebApi.Services;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Controllers
{
    [ApiController]
    public class QuizController : ControllerBase
    {
        private readonly IQuizService _quizService;

        public QuizController(IQuizService quizService)
        {
            _quizService = quizService;
        }

        [HttpPost]
        [Route(Routes.QuizzesGrid)]
        public async Task<RestResponse<GridData<QuizRow>>> GetGridData(GridRequest request)
        {
            var response = await _quizService.GetTemplatesGridData(request);

            return RestResponse<GridData<QuizRow>>.CreateResponse(response);
        }

        [HttpDelete]
        [Route(Routes.DeleteQuizz)]
        public async Task<RestResponse<bool>> DeleteQuizz(int id)
        {
            await _quizService.DeleteQuizz(id);

            return RestResponse<bool>.CreateResponse(true);
        }
    }
}
