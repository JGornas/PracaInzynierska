using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.LandingPages;

namespace PhishApp.WebApi.Services.Interfaces
{
    public interface ILandingPageService
    {
        Task DeleteLandingPage(int id);
        Task<LandingPage> GetLandingPage(int id);
        Task<GridData<LandingPageEntity>> GetLandingPagesGridData(GridRequest request);
    }
}
