using PhishApp.WebApi.Infrastructure;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Repositories.Interfaces;

namespace PhishApp.WebApi.Repositories
{
    public class LandingPageRepository : ILandingPageRepository
    {
        private readonly DataContext _context;

        public LandingPageRepository(DataContext context)
        {
            _context = context;
        }

        public async Task DeleteTemplateAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Id musi być większe od zera.", nameof(id));

            var template = await _context.LandingPages.FindAsync(id);

            if (template == null)
                throw new Exception("Nie ma szablonu o podanym id");

            _context.LandingPages.Remove(template);
            await _context.SaveChangesAsync();
        }

        public async Task<LandingPageEntity?> GetById(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Id musi być większe od zera.", nameof(id));

            var landingPage = await _context.LandingPages.FindAsync(id);

            return landingPage;
        }

    }
}
