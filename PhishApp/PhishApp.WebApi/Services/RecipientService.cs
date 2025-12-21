using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.Recipients;
using PhishApp.WebApi.Models.Rows;
using PhishApp.WebApi.Repositories.Interfaces;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Services
{
    public class RecipientService : IRecipientService
    {
        private readonly IRecipientRepository _recipientRepository;
        private readonly IGridService _gridService;

        public RecipientService(IRecipientRepository recipientRepository, IGridService gridService)
        {
            _recipientRepository = recipientRepository;
            _gridService = gridService;
        }

        public async Task<GridData<RecipientGroupRow>> GetRecipientGroupGridData(GridRequest request)
        {
            return await _gridService.GetGridData<RecipientGroupRow>(request);
        }

        public async Task<IReadOnlyCollection<Recipient>> GetRecipientsAsync()
        {
            var entities = await _recipientRepository.GetRecipientsAsync();
            return entities.Select(MapRecipient).ToList();
        }

        public async Task<Recipient> CreateRecipientAsync(Recipient recipient)
        {
            var normalized = NormalizeRecipientForSave(recipient);
            await EnsureEmailNotInUse(normalized.Email);

            var entity = new RecipientEntity
            {
                Email = normalized.Email,
                FirstName = normalized.FirstName,
                LastName = normalized.LastName,
                Position = normalized.Position,
                ExternalId = normalized.ExternalId
            };

            var saved = await _recipientRepository.AddRecipientAsync(entity);
            return MapRecipient(saved);
        }

        public async Task<Recipient> UpdateRecipientAsync(int id, Recipient recipient)
        {
            var normalized = NormalizeRecipientForSave(recipient);
            var existing = await _recipientRepository.GetRecipientByIdAsync(id) ??
                throw new InvalidOperationException($"Recipient with id {id} not found");

            var duplicate = await _recipientRepository.GetRecipientByEmailAsync(normalized.Email);
            if (duplicate is not null && duplicate.Id != id)
            {
                throw new InvalidOperationException($"Recipient with email {normalized.Email} already exists.");
            }

            existing.Email = normalized.Email;
            existing.FirstName = normalized.FirstName;
            existing.LastName = normalized.LastName;
            existing.Position = normalized.Position;
            existing.ExternalId = normalized.ExternalId;

            var updated = await _recipientRepository.UpdateRecipientAsync(existing);
            return MapRecipient(updated);
        }

        public async Task DeleteRecipientAsync(int id)
        {
            await _recipientRepository.DeleteRecipientAsync(id);
        }

        public async Task<IReadOnlyCollection<RecipientGroup>> GetGroupsAsync()
        {
            var entities = await _recipientRepository.GetGroupsAsync();
            return entities.Select(MapGroup).ToList();
        }

        public async Task<RecipientGroup?> GetGroupByIdAsync(int id)
        {
            var group = await _recipientRepository.GetGroupByIdAsync(id);

            return group is null ? null : MapGroup(group);
        }

        public async Task<RecipientGroup> CreateGroupAsync(RecipientGroup group)
        {
            var normalized = NormalizeGroup(group);
            var memberEntities = await EnsureMembers(normalized.Members);
            if (memberEntities.Count == 0)
            {
                throw new InvalidOperationException("Group must contain at least one recipient.");
            }

            var groupEntity = new RecipientGroupEntity
            {
                Name = normalized.Name,
                Campaign = normalized.Campaign
            };

            var saved = await _recipientRepository.AddGroupAsync(groupEntity, memberEntities.Select(m => m.Id));
            return MapGroup(saved);
        }

        public async Task<RecipientGroup> UpdateGroupAsync(int id, RecipientGroup group)
        {
            var normalized = NormalizeGroup(group);
            var memberEntities = await EnsureMembers(normalized.Members);
            if (memberEntities.Count == 0)
            {
                throw new InvalidOperationException("Group must contain at least one recipient.");
            }

            var groupEntity = new RecipientGroupEntity
            {
                Id = id,
                Name = normalized.Name,
                Campaign = normalized.Campaign
            };

            var updated = await _recipientRepository.UpdateGroupAsync(id, groupEntity, memberEntities.Select(m => m.Id));
            return MapGroup(updated);
        }

        public async Task DeleteGroupAsync(int id)
        {
            await _recipientRepository.DeleteGroupAsync(id);
        }

        private async Task EnsureEmailNotInUse(string email)
        {
            var existing = await _recipientRepository.GetRecipientByEmailAsync(email);
            if (existing is not null)
            {
                throw new InvalidOperationException($"Recipient with email {email} already exists.");
            }
        }

        private static Recipient MapRecipient(RecipientEntity entity)
        {
            return new Recipient
            {
                Id = entity.Id,
                Email = entity.Email,
                FirstName = entity.FirstName,
                LastName = entity.LastName,
                Position = entity.Position,
                ExternalId = entity.ExternalId,
                CreatedAt = entity.CreatedAt
            };
        }

        private static RecipientGroup MapGroup(RecipientGroupEntity entity)
        {
            var members = entity.Members
                .Select(m => MapRecipient(m.Recipient))
                .OrderBy(m => m.Email)
                .ToList();

            return new RecipientGroup
            {
                Id = entity.Id,
                Name = entity.Name,
                Campaign = entity.Campaign,
                CreatedAt = entity.CreatedAt,
                Members = members
            };
        }

        private static Recipient NormalizeRecipientForSave(Recipient recipient)
        {
            if (recipient is null)
            {
                throw new ArgumentNullException(nameof(recipient));
            }

            if (string.IsNullOrWhiteSpace(recipient.Email))
            {
                throw new ArgumentException("Email is required", nameof(recipient.Email));
            }

            recipient.Email = recipient.Email.Trim().ToLowerInvariant();
            recipient.FirstName = NormalizeOptional(recipient.FirstName);
            recipient.LastName = NormalizeOptional(recipient.LastName);
            recipient.Position = NormalizeOptional(recipient.Position);
            recipient.ExternalId = NormalizeOptional(recipient.ExternalId);

            return recipient;
        }

        private static RecipientGroup NormalizeGroup(RecipientGroup group)
        {
            if (group is null)
            {
                throw new ArgumentNullException(nameof(group));
            }

            if (string.IsNullOrWhiteSpace(group.Name))
            {
                throw new ArgumentException("Group name is required", nameof(group.Name));
            }

            group.Name = group.Name.Trim();
            group.Campaign = NormalizeOptional(group.Campaign);
            group.Members ??= new List<Recipient>();

            return group;
        }

        private async Task<List<RecipientEntity>> EnsureMembers(IEnumerable<Recipient> members)
        {
            var result = new List<RecipientEntity>();
            foreach (var member in members)
            {
                var normalized = NormalizeRecipientForSave(new Recipient
                {
                    Id = member.Id,
                    Email = member.Email,
                    FirstName = member.FirstName,
                    LastName = member.LastName,
                    Position = member.Position,
                    ExternalId = member.ExternalId
                });

                var entity = await EnsureRecipientEntity(normalized);
                result.Add(entity);
            }

            return result;
        }

        private async Task<RecipientEntity> EnsureRecipientEntity(Recipient member)
        {
            RecipientEntity? entity = null;

            if (member.Id > 0)
            {
                entity = await _recipientRepository.GetRecipientByIdAsync(member.Id);
            }

            if (entity is null)
            {
                entity = await _recipientRepository.GetRecipientByEmailAsync(member.Email);
            }

            if (entity is null)
            {
                var newEntity = new RecipientEntity
                {
                    Email = member.Email,
                    FirstName = member.FirstName,
                    LastName = member.LastName,
                    Position = member.Position,
                    ExternalId = member.ExternalId
                };

                return await _recipientRepository.AddRecipientAsync(newEntity);
            }

            var requiresUpdate = false;

            if (!string.Equals(entity.FirstName, member.FirstName, StringComparison.Ordinal))
            {
                entity.FirstName = member.FirstName;
                requiresUpdate = true;
            }

            if (!string.Equals(entity.LastName, member.LastName, StringComparison.Ordinal))
            {
                entity.LastName = member.LastName;
                requiresUpdate = true;
            }

            if (!string.Equals(entity.Position, member.Position, StringComparison.Ordinal))
            {
                entity.Position = member.Position;
                requiresUpdate = true;
            }

            if (!string.Equals(entity.ExternalId, member.ExternalId, StringComparison.Ordinal))
            {
                entity.ExternalId = member.ExternalId;
                requiresUpdate = true;
            }

            if (requiresUpdate)
            {
                entity = await _recipientRepository.UpdateRecipientAsync(entity);
            }

            return entity;
        }

        private static string? NormalizeOptional(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            var trimmed = value.Trim();
            return trimmed.Length == 0 ? null : trimmed;
        }
    }
}
