using PhishApp.WebApi.Infrastructure;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.LandingPages;
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

        public async Task<LandingPageEntity> UpdateLandingPageAsync(LandingPageEntity landingPage)
        {
            if (landingPage is null)
                throw new ArgumentNullException(nameof(landingPage));

            LandingPageEntity? existing = null;

            if (landingPage.Id == 0)
            {
                await _context.LandingPages.AddAsync(landingPage);
            }
            else
            {
                existing = await _context.LandingPages.FindAsync(landingPage.Id);
                if (existing != null)
                {
                    _context.Entry(existing).CurrentValues.SetValues(landingPage);
                    landingPage = existing;
                }
                else
                {
                    await _context.LandingPages.AddAsync(landingPage);
                }
            }

            await _context.SaveChangesAsync();

            return landingPage;
        }


    }
}
