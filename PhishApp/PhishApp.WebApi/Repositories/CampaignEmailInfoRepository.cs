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
        public async Task AddEmailInfoAsync(int campaignId, int recipientMemberId, bool isSent, Guid pixelId, string message = "")
        {
            var entity = new CampaignGroupMemberEmailInfoEntity
            {
                CampaignId = campaignId,
                RecipientMemberId = recipientMemberId,
                IsSent = isSent,
                SentAt = DateTime.UtcNow,
                Message = message,
                PixelId = pixelId
            };

            await _context.CampaignGroupMemberEmailInfos.AddAsync(entity);
            await _context.SaveChangesAsync();
        }
    }
}
