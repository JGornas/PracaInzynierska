using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.Rows;

namespace PhishApp.WebApi.Services.Interfaces
{
    public interface ITemplateService
    {
        Task<GridData<TemplateRow>> GetTemplatesGridData(GridRequest request);
    }
}
