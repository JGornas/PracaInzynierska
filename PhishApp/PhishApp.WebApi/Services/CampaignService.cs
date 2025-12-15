using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Models.Campaigns;
using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.LandingPages;
using PhishApp.WebApi.Models.Recipients;
using PhishApp.WebApi.Models.Rows;
using PhishApp.WebApi.Models.SendingProfiles;
using PhishApp.WebApi.Models.Templates;
using PhishApp.WebApi.Repositories;
using PhishApp.WebApi.Repositories.Interfaces;
using PhishApp.WebApi.Services.Interfaces;
using System.Globalization;

namespace PhishApp.WebApi.Services
{
    public class CampaignService : ICampaignService
    {
        private readonly ICampaignRepository _campaignRepository;
        private readonly ICampaignEmailInfoRepository _campaignEmailInfoRepository;
        private readonly IGridService _gridService;

        public CampaignService(ICampaignRepository campaignRepository, IGridService gridService, ICampaignEmailInfoRepository campaignEmailInfoRepository)
        {
            _campaignRepository = campaignRepository;
            _gridService = gridService;
            _campaignEmailInfoRepository = campaignEmailInfoRepository;
        }

        public async Task<GridData<CampaignRow>> GetCampaignsGridData(GridRequest request)
        {
            return await _gridService.GetGridData<CampaignRow>(request);
        }

        public async Task<Campaign?> GetCampaignByLandingId(Guid id)
        {
            var campaignEntity = await _campaignRepository.GetCampaignByLandingId(id);
            if (campaignEntity == null)
                return null;

            return BuildCampaign(campaignEntity);
        }

        public async Task DeleteCampaign(int id)
        {
            await _campaignRepository.DeleteWithRelationsAsync(id);
        }

        public async Task<Campaign?> GetCampaignById(int id)
        {
            var entity = await _campaignRepository.GetByIdAsync(id);

            if (entity == null)
                return null;

            return BuildCampaign(entity);
        }

        public async Task<List<Campaign>> GetNotSentAync()
        {
            List<Campaign> campaigns = new List<Campaign>();
            var campaignEntities = await _campaignRepository.GetNotSentAync();
            foreach(var entity in campaignEntities)
            {
                campaigns.Add(BuildCampaign(entity));
            }
            return campaigns;
        }

        public async Task<List<Campaign>> GetNotSent()
        {
            var campaigns = new List<Campaign>();
            var campaignEntities = await _campaignRepository.GetNotSentAync();
            foreach (var entity in campaignEntities)
            {
                campaigns.Add(BuildCampaign(entity));
            }
            return campaigns;
        }

        public async Task<Campaign> UpdateCampaign(Campaign campaign)
        {
            var existingEntity = await _campaignRepository.GetByIdAsync(campaign.Id);

            if (existingEntity == null)
            {
                var newEntity = BuildCampaignEntity(campaign);
                await _campaignRepository.AddAsync(newEntity);

                var added = await _campaignRepository.GetByIdAsync(newEntity.Id);
                return BuildCampaign(added!);
            }

            existingEntity.Name = campaign.Name;
            existingEntity.Description = campaign.Description;
            existingEntity.SendTime = DateTimeHelper.FromLocalString(campaign.SendTime);


            existingEntity.SendingProfileId = campaign.SendingProfile?.Id;
            existingEntity.TemplateId = campaign.Template?.Id;
            existingEntity.LandingPageId = campaign.LandingPage?.Id;

            var currentGroupIds = existingEntity.CampaignRecipientGroups
                .Select(crg => crg.RecipientGroupId)
                .ToList();

            var updatedGroupIds = campaign.CampaignRecipientGroups
                .Select(g => g.Id)
                .ToList();

            var groupsToAdd = updatedGroupIds.Except(currentGroupIds);
            foreach (var groupId in groupsToAdd)
            {
                existingEntity.CampaignRecipientGroups.Add(new CampaignRecipientGroupEntity
                {
                    CampaignId = existingEntity.Id,
                    RecipientGroupId = groupId
                });
            }

            var groupsToRemove = existingEntity.CampaignRecipientGroups
                .Where(crg => !updatedGroupIds.Contains(crg.RecipientGroupId))
                .ToList();

            foreach (var gr in groupsToRemove)
            {
                existingEntity.CampaignRecipientGroups.Remove(gr);
            }

            await _campaignRepository.UpdateAsync(existingEntity);

            var refreshed = await _campaignRepository.GetByIdAsync(existingEntity.Id);

            if (refreshed == null)
                throw new Exception("Wystąpił błąd. Nie znaleziono kampanii");

            return BuildCampaign(refreshed);
        }

        public async Task MarkCampaignAsSentAsync(int campaignId, bool isSentSuccessfully)
        {
            await _campaignRepository.MarkAsSentAsync(campaignId, isSentSuccessfully);
        }

        public async Task AddEmailInfoAsync(int campaignId, int recipientMemberId, bool isSent, Guid pixelId, Guid? landingId, string message = "")
        {
            await _campaignEmailInfoRepository.AddEmailInfoAsync(campaignId, recipientMemberId, isSent, pixelId, landingId, message);
        }

        private CampaignEntity BuildCampaignEntity(Campaign campaign)
        {
            var entity = new CampaignEntity
            {
                Id = campaign.Id,
                Name = campaign.Name,
                Description = campaign.Description,
                TemplateId = campaign.Template?.Id,
                LandingPageId = campaign.LandingPage?.Id,
                SendingProfileId = campaign.SendingProfile?.Id,
                SendTime = DateTimeHelper.FromLocalString(campaign.SendTime),
                IsSentSuccessfully = campaign.IsSentSuccessfully,
                CampaignRecipientGroups = campaign.CampaignRecipientGroups
                    .Select(g => new CampaignRecipientGroupEntity
                    {
                        CampaignId = campaign.Id,
                        RecipientGroupId = g.Id
                    })
                    .ToList()
            };
            return entity;
        }

        private Campaign BuildCampaign(CampaignEntity entity)
        {
            var campaign = new Campaign
            {
                Id = entity.Id,
                Name = entity.Name,
                Description = entity.Description,
                SendTime = DateTimeHelper.ToLocalString(entity.SendTime),
                IsSentSuccessfully = entity.IsSentSuccessfully,

                SendingProfile = entity.SendingProfile != null ? new SendingProfile
                {
                    Id = entity.SendingProfile.Id,
                    Name = entity.SendingProfile.Name,
                    Protocol = entity.SendingProfile.Protocol,
                    SenderName = entity.SendingProfile.SenderName,
                    SenderEmail = entity.SendingProfile.SenderEmail,
                    Password = entity.SendingProfile.Password,
                    Host = entity.SendingProfile.Host,
                    Port = entity.SendingProfile.Port,
                    Username = entity.SendingProfile.Username,
                    UseSsl = entity.SendingProfile.UseSsl,
                    ReplyTo = entity.SendingProfile.ReplyTo,
                    HasPassword = !string.IsNullOrEmpty(entity.SendingProfile.Password),
                    TestEmail = entity.SendingProfile.TestEmail

                } : null,

                Template = entity.Template != null ? new Template
                {
                    Id = entity.Template.Id,
                    Name = entity.Template.Name,
                    Subject = entity.Template.Subject,
                    Content = entity.Template.Content,
                    DesignObject = entity.Template.DesignObject,
                } : null,

                LandingPage = entity.LandingPage != null ? new LandingPage
                {
                    Id = entity.LandingPage.Id,
                    Name = entity.LandingPage.Name,
                    Content = entity.LandingPage.Content,
                } : null,

                CampaignRecipientGroups = entity.CampaignRecipientGroups
                    .Select(crg => new RecipientGroup
                    {
                        Id = crg.RecipientGroupId,
                        Name = crg.RecipientGroup.Name,
                        Campaign = crg.RecipientGroup.Campaign,
                        CreatedAt = crg.RecipientGroup.CreatedAt,
                        Members = crg.RecipientGroup.Members
                            .Select(m => new Recipient
                            {
                                Id = m.Recipient.Id,
                                GroupMemberId = m.Id,
                                Email = m.Recipient.Email,
                                FirstName = m.Recipient.FirstName,
                                LastName = m.Recipient.LastName,
                                Position = m.Recipient.Position,
                                ExternalId = m.Recipient.ExternalId,
                                CreatedAt = m.Recipient.CreatedAt
                            })
                            .ToList()
                    })
                    .ToList()
            };

            return campaign;
        }

    }
}
