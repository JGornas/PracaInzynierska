using PhishApp.WebApi.Models.Identity;

namespace PhishApp.WebApi.Repositories.Interfaces
{
    public interface ITemplateRepository
    {
        Task DeleteTemplateAsync(int id);
        Task<TemplateEntity?> GetTemplateByIdAsync(int id);
        Task<TemplateEntity> UpdateTemplateAsync(TemplateEntity template);
    }
}
