using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhishApp.WebApi.Helpers;
using PhishApp.WebApi.Models.RestApi;
using PhishApp.WebApi.Models.SendingProfiles;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Controllers
{
    [ApiController]
    [Authorize]
    public class SendingProfilesController : ControllerBase
    {
        private readonly ISendingProfileService _sendingProfileService;

        public SendingProfilesController(ISendingProfileService sendingProfileService)
        {
            _sendingProfileService = sendingProfileService;
        }

        [HttpGet]
        [Route(Routes.GetSendingProfiles)]
        public async Task<RestResponse<IReadOnlyCollection<SendingProfile>>> GetProfiles()
        {
            var profiles = await _sendingProfileService.GetProfilesAsync();
            return RestResponse<IReadOnlyCollection<SendingProfile>>.CreateResponse(profiles);
        }

        [HttpGet]
        [Route(Routes.GetSendingProfile)]
        public async Task<RestResponse<SendingProfile>> GetProfile(int id)
        {
            var profile = await _sendingProfileService.GetProfileAsync(id);
            return RestResponse<SendingProfile>.CreateResponse(profile);
        }

        [HttpPost]
        [Route(Routes.CreateSendingProfile)]
        public async Task<RestResponse<SendingProfile>> CreateProfile([FromBody] SendingProfile profile)
        {
            var created = await _sendingProfileService.CreateProfileAsync(profile);
            return RestResponse<SendingProfile>.CreateResponse(created);
        }

        [HttpPut]
        [Route(Routes.UpdateSendingProfile)]
        public async Task<RestResponse<SendingProfile>> UpdateProfile(int id, [FromBody] SendingProfile profile)
        {
            var updated = await _sendingProfileService.UpdateProfileAsync(id, profile);
            return RestResponse<SendingProfile>.CreateResponse(updated);
        }

        [HttpDelete]
        [Route(Routes.DeleteSendingProfile)]
        public async Task<RestResponse<bool>> DeleteProfile(int id)
        {
            await _sendingProfileService.DeleteProfileAsync(id);
            return RestResponse<bool>.CreateResponse(true);
        }

        [HttpPost]
        [Route(Routes.SendOneTimeEmail)]
        public async Task<RestResponse<bool>> SendOneTimeEmail(int SendingProfileId)
        {
            await _sendingProfileService.SendOneTimeEmail(SendingProfileId);
            return RestResponse<bool>.CreateResponse(true);
        }
    }
}
