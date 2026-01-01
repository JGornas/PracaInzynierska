using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.Rows;
using System.Reflection.Emit;

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
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            });

            builder.Entity<RecipientGroupEntity>(entity =>
            {
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
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

            builder.Entity<SendingProfileEntity>(entity =>
            {
                entity.HasIndex(e => e.Name).IsUnique();
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Protocol).IsRequired().HasMaxLength(50);
                entity.Property(e => e.SenderName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.SenderEmail).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Host).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Port).HasDefaultValue(587);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Password).IsRequired();
                entity.Property(e => e.ReplyTo).HasMaxLength(200);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            });

            builder.Entity<CampaignEntity>(entity =>
            {
                entity.HasMany(c => c.CampaignRecipientGroups)
                      .WithOne(crg => crg.Campaign)
                      .HasForeignKey(crg => crg.CampaignId);

                entity.HasOne(c => c.Template)
                      .WithMany()
                      .HasForeignKey(c => c.TemplateId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(c => c.LandingPage)
                      .WithMany()
                      .HasForeignKey(c => c.LandingPageId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(c => c.SendingProfile)
                      .WithMany()
                      .HasForeignKey(c => c.SendingProfileId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            builder.Entity<RecipientGroupEntity>(entity =>
            {
                entity.HasMany(r => r.CampaignRecipientGroups)
                      .WithOne(crg => crg.RecipientGroup)
                      .HasForeignKey(crg => crg.RecipientGroupId);
            });

            builder.Entity<CampaignRecipientGroupEntity>(entity =>
            {
                entity.HasKey(crg => crg.Id);
                entity.ToTable("CampaignRecipientGroups");
            });

            builder.Entity<CampaignGroupMemberEmailInfoEntity>(entity =>
            {
                entity.HasOne(e => e.Campaign)
                      .WithMany(c => c.CampaignGroupMemberEmailInfos)
                      .HasForeignKey(e => e.CampaignId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.RecipientMember)
                      .WithMany()
                      .HasForeignKey(e => e.RecipientMemberId)
                      .OnDelete(DeleteBehavior.SetNull);

            });


            builder.Entity<QuizEntity>()
                .HasMany(q => q.Questions)
                .WithOne(q => q.Quiz)
                .HasForeignKey(q => q.QuizId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<QuestionEntity>()
                .HasMany(q => q.Answers)
                .WithOne(a => a.Question)
                .HasForeignKey(a => a.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<QuestionEntity>()
                .HasOne(q => q.CorrectAnswer)
                .WithMany()
                .HasForeignKey(q => q.CorrectAnswerId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
        }


        public DbSet<TemplateEntity> Templates { get; set; }
        public DbSet<RecipientEntity> Recipients { get; set; }
        public DbSet<RecipientGroupEntity> RecipientGroups { get; set; }
        public DbSet<RecipientGroupMemberEntity> RecipientGroupMembers { get; set; }
        public DbSet<CampaignGroupMemberEmailInfoEntity> CampaignGroupMemberEmailInfos { get; set; }
        public DbSet<LandingPageEntity> LandingPages { get; set; }
        public DbSet<SendingProfileEntity> SendingProfiles { get; set; }
        public DbSet<CampaignEntity> Campaigns { get; set; }
        public DbSet<CampaignRecipientGroupEntity> CampaignRecipientGroups { get; set; }
        public DbSet<QuizEntity> Quizzes { get; set; }
        public DbSet<QuestionEntity> Questions { get; set; }
        public DbSet<AnswerEntity> Answers { get; set; }


        public DbSet<TemplateRow> TemplateRows { get; set; }
        public DbSet<CampaignRow> CampaignRows { get; set; }
        public DbSet<RecipientGroupRow> RecipientGroupRows { get; set; }
        public DbSet<QuizRow> QuizRows { get; set; }
    }
}