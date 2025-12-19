using Microsoft.AspNetCore.Mvc;
using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.RestApi;
using PhishApp.WebApi.Models.Rows;
using PhishApp.WebApi.Models.Quizzes;
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

        [HttpGet]
        [Route(Routes.GetQuiz)]
        public async Task<RestResponse<QuizDto>> GetQuiz(int id)
        {
            var quiz = await _quizService.GetQuizAsync(id);
            return RestResponse<QuizDto>.CreateResponse(quiz);
        }

        [HttpPost]
        [Route(Routes.CreateQuiz)]
        public async Task<RestResponse<QuizDto>> CreateQuiz([FromBody] QuizPayload payload)
        {
            var quiz = await _quizService.SaveQuizAsync(payload);
            return RestResponse<QuizDto>.CreateResponse(quiz);
        }

        [HttpPut]
        [Route(Routes.UpdateQuiz)]
        public async Task<RestResponse<QuizDto>> UpdateQuiz(int id, [FromBody] QuizPayload payload)
        {
            payload.Id = id;
            var quiz = await _quizService.SaveQuizAsync(payload);
            return RestResponse<QuizDto>.CreateResponse(quiz);
        }
    }
}
