using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.Recipients;
using PhishApp.WebApi.Models.Rows;

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

            builder.Entity<RecipientEntity>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Email).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            builder.Entity<RecipientGroupEntity>(entity =>
            {
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            builder.Entity<RecipientGroupMemberEntity>(entity =>
            {
                entity.HasOne(m => m.Group)
                    .WithMany(g => g.Members)
                    .HasForeignKey(m => m.GroupId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(m => m.Recipient)
                    .WithMany(r => r.GroupMemberships)
                    .HasForeignKey(m => m.RecipientId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }

        public DbSet<TemplateEntity> Templates { get; set; }
        public DbSet<TemplateRow> TemplateRows { get; set; }
        public DbSet<RecipientEntity> Recipients { get; set; }
        public DbSet<RecipientGroupEntity> RecipientGroups { get; set; }
        public DbSet<RecipientGroupMemberEntity> RecipientGroupMembers { get; set; }
    }
}
