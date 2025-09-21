using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.Rows;
using PhishApp.WebApi.Models.Templates;
using PhishApp.WebApi.Repositories.Interfaces;
using PhishApp.WebApi.Services.Interfaces;
using System.Net.NetworkInformation;
using System.Text.Json;

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

        public async Task<Template> GetTemplate(int id)
        {
            var templateEntity = await  _templateRepository.GetTemplateByIdAsync(id);
            var template = BuildTemplate(templateEntity);

            return template;
        }

        public async Task DeleteTemplate(int id)
        {
            await _templateRepository.DeleteTemplateAsync(id);
        }
        public async Task<Template> UpdateTemplate(Template template)
        {
            TemplateEntity templateEntity = BuildTemplateEntity(template);
            await _templateRepository.UpdateTemplateAsync(templateEntity);
            template = BuildTemplate(templateEntity);
            return template;
        }

        private static Template BuildTemplate(TemplateEntity? templateEntity)
        {
            if (templateEntity == null) 
            {
                throw new ArgumentNullException("Podany szablon nie istnieje");
            }

            var template = new Template
            {
                Id = templateEntity.Id,
                Name = templateEntity.Name,
                Subject = templateEntity.Subject,
                Content = templateEntity.Content,
                DesignObject = string.IsNullOrEmpty(templateEntity.DesignObject) ? null : JsonSerializer.Deserialize<object>(templateEntity.DesignObject)
            };
            return template;
        }

        private static TemplateEntity BuildTemplateEntity(Template template)
        {

            Validate(template);
            return new TemplateEntity
            {
                Id = template.Id,
                Name = template.Name,
                Subject = template.Subject,
                Content = template.Content,
                DesignObject = template.DesignObjectJson
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
            if (string.IsNullOrEmpty(template.Name))
            {
                throw new ArgumentException("Nazwa musi być uzupełniona");
            }
            if (string.IsNullOrEmpty(template.Subject))
            {
                throw new ArgumentException("Temat maila musi być uzupełniony");
            }
            if (string.IsNullOrEmpty(template.Content) || template.DesignObject is null)
            {
                throw new ArgumentException("Zawartość maila musi być uzupełniona");
            }
        }

        
    }
}
