using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using PhishApp.WebApi.Infrastructure;
using PhishApp.WebApi.Models.SendingProfiles;
using PhishApp.WebApi.Repositories.Interfaces;

namespace PhishApp.WebApi.Repositories
{
    public class SendingProfileRepository : ISendingProfileRepository
    {
        private readonly DataContext _context;

        public SendingProfileRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyCollection<SendingProfileEntity>> GetProfilesAsync()
        {
            return await _context.SendingProfiles
                .AsNoTracking()
                .OrderBy(p => p.Name)
                .ToListAsync();
        }

        public async Task<SendingProfileEntity?> GetByIdAsync(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentException("Id must be greater than zero", nameof(id));
            }

            return await _context.SendingProfiles.FindAsync(id);
        }

        public async Task<SendingProfileEntity?> GetByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return null;
            }

            return await _context.SendingProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Name == name);
        }

        public async Task<SendingProfileEntity> AddAsync(SendingProfileEntity entity)
        {
            if (entity is null)
            {
                throw new ArgumentNullException(nameof(entity));
            }

            entity.CreatedAt = DateTime.UtcNow;
            _context.SendingProfiles.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<SendingProfileEntity> UpdateAsync(SendingProfileEntity entity)
        {
            if (entity is null)
            {
                throw new ArgumentNullException(nameof(entity));
            }

            entity.UpdatedAt = DateTime.UtcNow;
            _context.SendingProfiles.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task DeleteAsync(int id)
        {
            var existing = await _context.SendingProfiles.FindAsync(id);
            if (existing is null)
            {
                throw new InvalidOperationException($"Sending profile with id {id} was not found");
            }

            _context.SendingProfiles.Remove(existing);
            await _context.SaveChangesAsync();
        }
    }
}
