using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Repositories.Interfaces;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Services
{
    public class TemplateService : ITemplateService
    {
        private readonly ITemplateRepository _templateRepository;
        private readonly IGridService _gridService;

        public TemplateService(ITemplateRepository templateRepository, IGridService gridService)
        {
            _templateRepository = templateRepository;
            _gridService = gridService;
        }

        public async Task<GridData<TemplateEntity>> GetTemplatesGridData(GridRequest request)
        {
            return await _gridService.GetGridData<TemplateEntity>(request);
        }
    }
}
