using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Identity;

namespace PhishApp.WebApi.Services.Interfaces
{
    public interface ILandingPageService
    {
        Task DeleteLandingPage(int id);
        Task<GridData<LandingPageEntity>> GetLandingPagesGridData(GridRequest request);
    }
}
