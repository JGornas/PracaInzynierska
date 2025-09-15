using PhishApp.WebApi.Infrastructure;
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
    }
}
