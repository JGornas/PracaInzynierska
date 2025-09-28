
using PhishApp.WebApi.Models.Identity;

namespace PhishApp.WebApi.Repositories.Interfaces
{
    public interface ILandingPageRepository
    {
        Task DeleteTemplateAsync(int id);
        Task<LandingPageEntity?> GetById(int id);
        Task<LandingPageEntity> UpdateLandingPageAsync(LandingPageEntity landingPage);
    }
}
