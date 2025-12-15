using Microsoft.EntityFrameworkCore;
using PhishApp.WebApi.Infrastructure;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Repositories.Interfaces;

namespace PhishApp.WebApi.Repositories
{
    public class CampaignEmailInfoRepository : ICampaignEmailInfoRepository
    {
        private readonly DataContext _context;

        public CampaignEmailInfoRepository(DataContext context)
        {
            _context = context;
        }
        public async Task AddEmailInfoAsync(int campaignId, int recipientMemberId, bool isSent, Guid pixelId, Guid? LandingId, string message = "")
        {
            var entity = new CampaignGroupMemberEmailInfoEntity
            {
                CampaignId = campaignId,
                RecipientMemberId = recipientMemberId,
                IsSent = isSent,
                SentAt = DateTime.Now,
                Message = message,
                PixelId = pixelId,
                LandingId= LandingId,
                IsEmailOpened = false,
            };

            await _context.CampaignGroupMemberEmailInfos.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateEmailOpenedAsync(Guid pixelId)
        {
            await _context.CampaignGroupMemberEmailInfos
                .Where(x => x.PixelId == pixelId)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(r => r.IsEmailOpened, true)
                    .SetProperty(r => r.OpenedTime, DateTime.Now)
                );
        }
        public async Task UpdateLandingPageOpenedAsync(Guid landingId)
        {
            await _context.CampaignGroupMemberEmailInfos
                .Where(x => x.LandingId == landingId)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(r => r.IsRedirectedToLandingPage, true)
                    .SetProperty(r => r.RedirectedToLandingPageTime, DateTime.Now)
                );
        }


    }
}
