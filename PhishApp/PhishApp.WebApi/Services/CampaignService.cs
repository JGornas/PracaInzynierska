using PhishApp.WebApi.Models.Campaigns;
using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.Recipients;
using PhishApp.WebApi.Models.Rows;
using PhishApp.WebApi.Repositories;
using PhishApp.WebApi.Repositories.Interfaces;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Services
{
    public class CampaignService : ICampaignService
    {
        private readonly ICampaignRepository _campaignRepository;
        private readonly IGridService _gridService;

        public CampaignService(ICampaignRepository campaignRepository, IGridService gridService)
        {
            _campaignRepository = campaignRepository;
            _gridService = gridService;
        }

        public async Task<GridData<CampaignRow>> GetCampaignsGridData(GridRequest request)
        {
            return await _gridService.GetGridData<CampaignRow>(request);
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


        public async Task<Campaign> UpdateCampaign(Campaign campaign)
        {
            var existingEntity = await _campaignRepository.GetByIdAsync(campaign.Id);

            if (existingEntity == null)
            {
                var newEntity = BuildCampaignEntity(campaign);
                await _campaignRepository.AddAsync(newEntity);
                return BuildCampaign(newEntity);
            }

            existingEntity.Name = campaign.Name;
            existingEntity.Description = campaign.Description;

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

            return BuildCampaign(existingEntity);
        }

        private CampaignEntity BuildCampaignEntity(Campaign campaign)
        {
            var entity = new CampaignEntity
            {
                Id = campaign.Id,
                Name = campaign.Name,
                Description = campaign.Description,
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
                CampaignRecipientGroups = entity.CampaignRecipientGroups
                    .Select(crg => new RecipientGroup
                    {
                        Id = crg.RecipientGroupId
                    })
                    .ToList()
            };
            return campaign;
        }
    }
}
