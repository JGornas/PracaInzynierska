using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Rows;
using PhishApp.WebApi.Repositories.Interfaces;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Services
{
    public class QuizService : IQuizService
    {
        private readonly IGridService _gridService;
        private readonly IQuizzRepository _quizzRepository;

        public QuizService(IGridService gridService, IQuizzRepository quizzRepository)
        {
            _gridService = gridService;
            _quizzRepository = quizzRepository;
        }

        public async Task DeleteQuizz(int id)
        {
            await _quizzRepository.DeleteQuizAsync(id);
        }

        public async Task<GridData<QuizRow>?> GetTemplatesGridData(GridRequest request)
        {
            return await _gridService.GetGridData<QuizRow>(request);
        }
    }
}
