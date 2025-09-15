using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Identity;

namespace PhishApp.WebApi.Services.Interfaces
{
    public interface ITemplateService
    {
        Task<GridData<TemplateEntity>> GetTemplatesGridData(GridRequest request);
    }
}
