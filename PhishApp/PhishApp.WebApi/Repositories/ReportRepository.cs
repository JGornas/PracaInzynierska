using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Infrastructure;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.Reports;
using PhishApp.WebApi.Repositories.Interfaces;

namespace PhishApp.WebApi.Repositories
{
    public class ReportRepository : IReportRepository
    {
        private readonly DataContext _context;

        public ReportRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<List<ReportSelectOption>> GetReportCampaignsFilter()
        {
            return await _context.Campaigns
                                        .AsNoTracking()
                                        .OrderBy(c => c.Name)
                                        .Select(c => new ReportSelectOption
                                        {
                                            Id = c.Id,
                                            Name = c.Name
                                        })
                                        .ToListAsync();
        }

        public async Task<List<ReportGroupOption>> GetReportGroupsFilter()
        {
            return await _context.CampaignRecipientGroups
                            .AsNoTracking()
                            .Select(g => new { g.CampaignId, g.RecipientGroupId, g.RecipientGroup.Name })
                            .GroupBy(g => new { g.CampaignId, g.RecipientGroupId, g.Name })
                            .Select(g => new ReportGroupOption
                            {
                                Id = g.Key.RecipientGroupId,
                                Name = g.Key.Name,
                                CampaignId = g.Key.CampaignId
                            })
                            .OrderBy(g => g.Name)
                            .ToListAsync();
        }

        public async Task<List<InteractionReportDto>> GetInteractionRow(ReportsFilterPayload payload)
        {
            var query = BuildFilteredQuery(payload, includeDetails: true);

            var raw = await query
                .OrderByDescending(i => i.SentAt)
                .Select(item => new
                {
                    item.Id,
                    item.CampaignId,
                    CampaignName = item.Campaign.Name,
                    GroupId = (int?)item.RecipientMember.GroupId,
                    GroupName = item.RecipientMember.Group.Name,
                    RecipientEmail = item.RecipientMember.Recipient.Email,
                    RecipientFirstName = item.RecipientMember.Recipient.FirstName,
                    RecipientLastName = item.RecipientMember.Recipient.LastName,
                    item.SentAt,
                    OpenedAt = item.OpenedTime,
                    ClickedAt = item.FormSubmittedTime ?? item.RedirectedToLandingPageTime,
                    SubmittedAt = item.FormSubmittedTime,
                    Opened = item.IsEmailOpened,
                    Clicked = item.IsRedirectedToLandingPage || item.IsFormSubmitted,
                    Submitted = item.IsFormSubmitted
                })
                .ToListAsync();

            var result = raw.Select(item => new InteractionReportDto
            {
                Id = item.Id,
                CampaignId = item.CampaignId,
                CampaignName = item.CampaignName,
                GroupId = item.GroupId,
                GroupName = item.GroupName,
                RecipientEmail = item.RecipientEmail,
                RecipientName = BuildRecipientName(item.RecipientFirstName, item.RecipientLastName),
                SentAt = item.SentAt,
                OpenedAt = item.OpenedAt,
                ClickedAt = item.ClickedAt,
                SubmittedAt = item.SubmittedAt,
                Opened = item.Opened,
                Clicked = item.Clicked,
                Submitted = item.Submitted
            }).ToList();
            return result;
        }

        private static string? BuildRecipientName(string? firstName, string? lastName)
        {
            var first = firstName?.Trim();
            var last = lastName?.Trim();

            if (string.IsNullOrWhiteSpace(first) && string.IsNullOrWhiteSpace(last))
            {
                return null;
            }

            if (string.IsNullOrWhiteSpace(first))
            {
                return last;
            }

            if (string.IsNullOrWhiteSpace(last))
            {
                return first;
            }

            return $"{first} {last}";
        }

        private IQueryable<CampaignGroupMemberEmailInfoEntity> BuildFilteredQuery(ReportsFilterPayload? payload, bool includeDetails)
        {
            var query = _context.CampaignGroupMemberEmailInfos.AsNoTracking();
            if (includeDetails)
            {
                query = query
                    .Include(x => x.Campaign)
                    .Include(x => x.RecipientMember)
                        .ThenInclude(m => m.Group)
                    .Include(x => x.RecipientMember)
                        .ThenInclude(m => m.Recipient);
            }

            if (payload?.CampaignId is > 0)
            {
                query = query.Where(x => x.CampaignId == payload.CampaignId);
            }

            if (payload?.GroupId is > 0)
            {
                query = query.Where(x => x.RecipientMember.GroupId == payload.GroupId);
            }

            var from = DateTimeHelper.ParseDate(payload?.DateFrom, endOfDay: false);
            if (from.HasValue)
            {
                query = query.Where(x => x.SentAt != null && x.SentAt >= from.Value);
            }

            var to = DateTimeHelper.ParseDate(payload?.DateTo, endOfDay: true);
            if (to.HasValue)
            {
                query = query.Where(x => x.SentAt != null && x.SentAt < to.Value);
            }

            return query;
        }

        public async Task<SummaryDto> GetReportSummary(ReportsFilterPayload payload)
        {
            var query = BuildFilteredQuery(payload, includeDetails: false);

            var summary = await query
                .GroupBy(_ => 1)
                .Select(group => new SummaryDto
                {
                    Sent = group.Count(x => x.IsSent),
                    Opened = group.Count(x => x.IsEmailOpened),
                    Clicked = group.Count(x => x.IsRedirectedToLandingPage || x.IsFormSubmitted),
                    Submitted = group.Count(x => x.IsFormSubmitted)
                })
                .FirstOrDefaultAsync() ?? new SummaryDto();

            return summary;
        }

        
    }
}
