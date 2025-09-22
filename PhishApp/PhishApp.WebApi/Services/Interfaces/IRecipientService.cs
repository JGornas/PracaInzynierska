﻿using PhishApp.WebApi.Models.Recipients;

namespace PhishApp.WebApi.Services.Interfaces
{
    public interface IRecipientService
    {
        Task<IReadOnlyCollection<Recipient>> GetRecipientsAsync();
        Task<Recipient> CreateRecipientAsync(Recipient recipient);
        Task<Recipient> UpdateRecipientAsync(int id, Recipient recipient);
        Task DeleteRecipientAsync(int id);

        Task<IReadOnlyCollection<RecipientGroup>> GetGroupsAsync();
        Task<RecipientGroup> CreateGroupAsync(RecipientGroup group);
        Task<RecipientGroup> UpdateGroupAsync(int id, RecipientGroup group);
        Task DeleteGroupAsync(int id);
    }
}
