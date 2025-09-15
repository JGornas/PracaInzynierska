using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PhishApp.WebApi.Models.Identity;

namespace PhishApp.WebApi.Infrastructure
{
    public class DataContext
    : IdentityDbContext<ApplicationUser, IdentityRole<int>, int,
        IdentityUserClaim<int>, IdentityUserRole<int>,
        IdentityUserLogin<int>, IdentityRoleClaim<int>, ApplicationUserToken>

    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.HasDefaultSchema(null);
        }

        public DbSet<TemplateEntity> Templates { get; set; }

    }
}
