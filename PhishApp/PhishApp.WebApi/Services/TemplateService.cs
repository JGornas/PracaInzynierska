using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.Rows;
using PhishApp.WebApi.Models.Templates;
using PhishApp.WebApi.Repositories.Interfaces;
using PhishApp.WebApi.Services.Interfaces;
using System.Net.NetworkInformation;

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

        public async Task<GridData<TemplateRow>> GetTemplatesGridData(GridRequest request)
        {
            return await _gridService.GetGridData<TemplateRow>(request);
        }

        public async Task<Template> UpdateTemplate(Template template)
        {
            TemplateEntity templateEntity = BuildTemplateEntity(template);
            await _templateRepository.UpdateTemplateAsync(templateEntity);
            template = BuildTemplate(templateEntity);
            return template;
        }

        private static Template BuildTemplate(TemplateEntity templateEntity)
        {
            var template = new Template
            {
                Id = templateEntity.Id,
                Name = templateEntity.Name,
                Subject = templateEntity.Subject,
                Content = templateEntity.Content,
            };
            Validate(template);
            return template;
        }

        private static TemplateEntity BuildTemplateEntity(Template template)
        {
            return new TemplateEntity
            {
                Id = template.Id,
                Name = template.Name,
                Subject = template.Subject,
                Content = template.Content,
            };
        }

        private static void Validate(Template template)
        {
            if(template == null)
            {
                throw new ArgumentNullException(nameof(template));
            }
            if (template.Id < 0) 
            {
                throw new ArgumentException(nameof(template.Id));
            }
            if (!string.IsNullOrEmpty(template.Name))
            {
                throw new ArgumentException(nameof(template.Name));
            }
            if (!string.IsNullOrEmpty(template.Subject))
            {
                throw new ArgumentException(nameof(template.Subject));
            }
            if (!string.IsNullOrEmpty(template.Content))
            {
                throw new ArgumentException(nameof(template.Content));
            }
        }

        
    }
}
