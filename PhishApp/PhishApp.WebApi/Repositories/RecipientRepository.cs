using Microsoft.EntityFrameworkCore;
using PhishApp.WebApi.Infrastructure;
using PhishApp.WebApi.Models.Identity;
using PhishApp.WebApi.Models.Recipients;
using PhishApp.WebApi.Repositories.Interfaces;

namespace PhishApp.WebApi.Repositories
{
    public class RecipientRepository : IRecipientRepository
    {
        private readonly DataContext _context;

        public RecipientRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyCollection<RecipientEntity>> GetRecipientsAsync()
        {
            return await _context.Recipients
                .AsNoTracking()
                .OrderBy(r => r.Email)
                .ToListAsync();
        }

        public async Task<RecipientEntity?> GetRecipientByIdAsync(int id)
        {
            if (id <= 0)
            {
                return null;
            }

            return await _context.Recipients.FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<RecipientEntity?> GetRecipientByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return null;
            }

            var normalized = email.Trim().ToLowerInvariant();
            return await _context.Recipients.FirstOrDefaultAsync(r => r.Email == normalized);
        }

        public async Task<RecipientEntity> AddRecipientAsync(RecipientEntity recipient)
        {
            if (recipient is null)
            {
                throw new ArgumentNullException(nameof(recipient));
            }

            await _context.Recipients.AddAsync(recipient);
            await _context.SaveChangesAsync();

            return recipient;
        }

        public async Task<RecipientEntity> UpdateRecipientAsync(RecipientEntity recipient)
        {
            if (recipient is null)
            {
                throw new ArgumentNullException(nameof(recipient));
            }

            var existing = await _context.Recipients.FirstOrDefaultAsync(r => r.Id == recipient.Id);
            if (existing is null)
            {
                throw new InvalidOperationException($"Recipient with id {recipient.Id} not found");
            }

            _context.Entry(existing).CurrentValues.SetValues(recipient);
            existing.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return existing;
        }

        public async Task DeleteRecipientAsync(int id)
        {
            var entity = await _context.Recipients.FirstOrDefaultAsync(r => r.Id == id);
            if (entity is null)
            {
                return;
            }

            _context.Recipients.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<IReadOnlyCollection<RecipientGroupEntity>> GetGroupsAsync()
        {
            return await _context.RecipientGroups
                .AsNoTracking()
                .Include(g => g.Members)
                    .ThenInclude(m => m.Recipient)
                .OrderBy(g => g.Name)
                .ToListAsync();
        }

        public async Task<RecipientGroupEntity?> GetGroupByIdAsync(int id)
        {
            if (id <= 0)
            {
                return null;
            }

            return await _context.RecipientGroups
                .Include(g => g.Members)
                    .ThenInclude(m => m.Recipient)
                .FirstOrDefaultAsync(g => g.Id == id);
        }

        public async Task<RecipientGroupEntity> AddGroupAsync(RecipientGroupEntity group, IEnumerable<int> memberRecipientIds)
        {
            if (group is null)
            {
                throw new ArgumentNullException(nameof(group));
            }

            var recipientIds = memberRecipientIds?.Distinct().ToList() ?? new List<int>();

            foreach (var recipientId in recipientIds)
            {
                group.Members.Add(new RecipientGroupMemberEntity
                {
                    RecipientId = recipientId
                });
            }

            await _context.RecipientGroups.AddAsync(group);
            await _context.SaveChangesAsync();

            return await GetGroupByIdAsync(group.Id) ?? group;
        }

        public async Task<RecipientGroupEntity> UpdateGroupAsync(int id, RecipientGroupEntity group, IEnumerable<int> memberRecipientIds)
        {
            var existing = await _context.RecipientGroups
                .Include(g => g.Members)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (existing is null)
            {
                throw new InvalidOperationException($"Group with id {id} not found");
            }

            existing.Name = group.Name;
            existing.Campaign = group.Campaign;
            existing.UpdatedAt = DateTime.Now;

            var desiredIds = memberRecipientIds?.Distinct().ToList() ?? new List<int>();

            var toRemove = existing.Members.Where(m => !desiredIds.Contains(m.RecipientId)).ToList();
            if (toRemove.Count > 0)
            {
                _context.RecipientGroupMembers.RemoveRange(toRemove);
            }

            var currentIds = existing.Members.Select(m => m.RecipientId).ToHashSet();
            var toAdd = desiredIds.Where(idValue => !currentIds.Contains(idValue)).ToList();
            foreach (var recipientId in toAdd)
            {
                existing.Members.Add(new RecipientGroupMemberEntity
                {
                    GroupId = existing.Id,
                    RecipientId = recipientId
                });
            }

            await _context.SaveChangesAsync();

            return await GetGroupByIdAsync(existing.Id) ?? existing;
        }

        public async Task DeleteGroupAsync(int id)
        {
            var existing = await _context.RecipientGroups.FirstOrDefaultAsync(g => g.Id == id);
            if (existing is null)
            {
                return;
            }

            _context.RecipientGroups.Remove(existing);
            await _context.SaveChangesAsync();
        }
    }
}
