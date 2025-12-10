using Microsoft.EntityFrameworkCore;
using PhishApp.WebApi.Infrastructure;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Repositories.Interfaces;

public class CampaignRepository : ICampaignRepository
{
    private readonly DataContext _context;

    public CampaignRepository(DataContext context)
    {
        _context = context;
    }

    public async Task AddAsync(CampaignEntity campaign)
    {
        _context.Campaigns.Add(campaign);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(CampaignEntity campaign)
    {
        _context.Campaigns.Update(campaign);
        await _context.SaveChangesAsync();
    }

    public async Task<CampaignEntity?> GetByIdAsync(int id)
    {
        return await _context.Campaigns
            .Include(c => c.CampaignRecipientGroups)
            .ThenInclude(crg => crg.RecipientGroup)
            .Include(c => c.SendingProfile)
            .Include(c => c.Template)
            .Include(c => c.LandingPage)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task MarkAsSentAsync(int campaignId, bool isSentSuccessfully)
    {
        var campaign = await _context.Campaigns
            .FirstOrDefaultAsync(c => c.Id == campaignId);

        if (campaign == null)
        {
            throw new InvalidOperationException($"Nie znaleziono kampanii o Id {campaignId}");
        }

        campaign.IsSentSuccessfully = isSentSuccessfully;
        campaign.SendTime = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task AddEmailInfoAsync(int campaignId, int recipientMemberId, bool isSent, string message = "")
    {
        var entity = new CampaignGroupMemberEmailInfoEntity
        {
            CampaignId = campaignId,
            RecipientMemberId = recipientMemberId,
            IsSent = isSent,
            SentAt = DateTime.UtcNow,
            Message = message
        };

        await _context.CampaignGroupMemberEmailInfos.AddAsync(entity);
        await _context.SaveChangesAsync();
    }

    public async Task<List<CampaignEntity>> GetNotSentAync()
    {
        return await _context.Campaigns
            .AsNoTracking()
            .Include(c => c.CampaignRecipientGroups)
            .ThenInclude(crg => crg.RecipientGroup)
            .ThenInclude(rg => rg.Members)
            .ThenInclude(m => m.Recipient)
            .Include(c => c.SendingProfile)
            .Include(c => c.Template)
            .Include(c => c.LandingPage)
            .Where(c => c.IsSentSuccessfully != true).ToListAsync();
    }

    public async Task DeleteWithRelationsAsync(int id)
    {
        var campaign = await _context.Campaigns
            .Include(c => c.CampaignRecipientGroups)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (campaign != null)
        {
            _context.CampaignRecipientGroups.RemoveRange(campaign.CampaignRecipientGroups);
            
            _context.Campaigns.Remove(campaign);
            await _context.SaveChangesAsync();
        }
    }
}
