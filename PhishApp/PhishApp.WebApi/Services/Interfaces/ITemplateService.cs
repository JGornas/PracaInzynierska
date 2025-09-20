using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.Rows;
using PhishApp.WebApi.Models.Templates;

namespace PhishApp.WebApi.Services.Interfaces
{
    public interface ITemplateService
    {
        Task<Template> GetTemplate(int id);
        Task<GridData<TemplateRow>> GetTemplatesGridData(GridRequest request);
        Task<Template> UpdateTemplate(Template template);
    }
}
