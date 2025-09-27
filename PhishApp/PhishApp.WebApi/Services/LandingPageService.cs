using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.Rows;
using PhishApp.WebApi.Repositories;
using PhishApp.WebApi.Repositories.Interfaces;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Services
{
    public class LandingPageService : ILandingPageService
    {
        private readonly ILandingPageRepository _landingPageRepository;
        private readonly IGridService _gridService;

        public LandingPageService(ILandingPageRepository landingPageRepository, IGridService gridService)
        {
            _landingPageRepository = landingPageRepository;
            _gridService = gridService;
        }

        public async Task DeleteLandingPage(int id)
        {
            await _landingPageRepository.DeleteTemplateAsync(id);
        }

        public async Task<GridData<LandingPageEntity>> GetLandingPagesGridData(GridRequest request)
        {
            return await _gridService.GetGridData<LandingPageEntity>(request);
        }
    }
}
