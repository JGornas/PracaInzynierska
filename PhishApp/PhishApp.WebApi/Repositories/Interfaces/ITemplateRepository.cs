using PhishApp.WebApi.Models.Identity;

namespace PhishApp.WebApi.Repositories.Interfaces
{
    public interface ITemplateRepository
    {
        Task<TemplateEntity> UpdateTemplateAsync(TemplateEntity template);
    }
}
