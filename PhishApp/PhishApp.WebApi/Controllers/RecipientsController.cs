using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Models.Grid;
using PhishApp.WebApi.Models.Recipients;
using PhishApp.WebApi.Models.RestApi;
using PhishApp.WebApi.Models.Rows;
using PhishApp.WebApi.Services;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Controllers
{
    [ApiController]
    [Authorize]
    public class RecipientsController : ControllerBase
    {
        private readonly IRecipientService _recipientService;

        public RecipientsController(IRecipientService recipientService)
        {
            _recipientService = recipientService;
        }

        [HttpGet]
        [Route(Routes.GetRecipients)]
        public async Task<RestResponse<IReadOnlyCollection<Recipient>>> GetRecipients()
        {
            var recipients = await _recipientService.GetRecipientsAsync();
            return RestResponse<IReadOnlyCollection<Recipient>>.CreateResponse(recipients);
        }

        [HttpPost]
        [Route(Routes.CreateRecipient)]
        public async Task<RestResponse<Recipient>> CreateRecipient([FromBody] Recipient recipient)
        {
            var created = await _recipientService.CreateRecipientAsync(recipient);
            return RestResponse<Recipient>.CreateResponse(created);
        }

        [HttpPut]
        [Route(Routes.UpdateRecipient)]
        public async Task<RestResponse<Recipient>> UpdateRecipient(int id, [FromBody] Recipient recipient)
        {
            var updated = await _recipientService.UpdateRecipientAsync(id, recipient);
            return RestResponse<Recipient>.CreateResponse(updated);
        }

        [HttpDelete]
        [Route(Routes.DeleteRecipient)]
        public async Task<RestResponse<bool>> DeleteRecipient(int id)
        {
            await _recipientService.DeleteRecipientAsync(id);
            return RestResponse<bool>.CreateResponse(true);
        }

        [HttpGet]
        [Route(Routes.GetRecipientGroups)]
        public async Task<RestResponse<IReadOnlyCollection<RecipientGroup>>> GetGroups()
        {
            var groups = await _recipientService.GetGroupsAsync();
            return RestResponse<IReadOnlyCollection<RecipientGroup>>.CreateResponse(groups);
        }

        [HttpPost]
        [Route(Routes.RecipientGroupsGrid)]
        public async Task<RestResponse<GridData<RecipientGroupRow>>> GetGridData(GridRequest request)
        {
            var response = await _recipientService.GetRecipientGroupGridData(request);

            return RestResponse<GridData<RecipientGroupRow>>.CreateResponse(response);
        }

        [HttpPost]
        [Route(Routes.CreateRecipientGroup)]
        public async Task<RestResponse<RecipientGroup>> CreateGroup([FromBody] RecipientGroup group)
        {
            var created = await _recipientService.CreateGroupAsync(group);
            return RestResponse<RecipientGroup>.CreateResponse(created);
        }

        [HttpPut]
        [Route(Routes.UpdateRecipientGroup)]
        public async Task<RestResponse<RecipientGroup>> UpdateGroup(int id, [FromBody] RecipientGroup group)
        {
            var updated = await _recipientService.UpdateGroupAsync(id, group);
            return RestResponse<RecipientGroup>.CreateResponse(updated);
        }

        [HttpDelete]
        [Route(Routes.DeleteRecipientGroup)]
        public async Task<RestResponse<bool>> DeleteGroup(int id)
        {
            await _recipientService.DeleteGroupAsync(id);
            return RestResponse<bool>.CreateResponse(true);
        }
    }
}
