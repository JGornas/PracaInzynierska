using PhishApp.WebApi.Infrastructure;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Repositories.Interfaces;

namespace PhishApp.WebApi.Repositories
{
    public class TemplateRepository : ITemplateRepository
    {
        private readonly DataContext _context;

        public TemplateRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<TemplateEntity?> GetTemplateByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Id musi być większe od zera.", nameof(id));

            var template = await _context.Templates.FindAsync(id);

            return template;
        }


        public async Task<TemplateEntity> UpdateTemplateAsync(TemplateEntity template)
        {
            if (template is null)
                throw new ArgumentNullException(nameof(template));

            TemplateEntity? existing = null;

            if (template.Id == 0)
            {
                await _context.Templates.AddAsync(template);
            }
            else
            {
                existing = await _context.Templates.FindAsync(template.Id);
                if (existing != null)
                {
                    _context.Entry(existing).CurrentValues.SetValues(template);
                    template = existing;
                }
                else
                {
                    await _context.Templates.AddAsync(template);
                }
            }

            await _context.SaveChangesAsync();

            return template;

        }
    }
}
