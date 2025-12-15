using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Pages
{
    [AllowAnonymous]
    public class LandingModel : PageModel
    {
        private readonly ICampaignService _campaignService;
        private readonly ITrackingService _trackingService;

        public LandingModel(ICampaignService campaignService, ITrackingService trackingService)
        {
            _campaignService = campaignService;
            _trackingService = trackingService;
        }

        public string LandingHtml { get; set; } = string.Empty;

        public async Task<IActionResult> OnGetAsync(Guid id)
        {
            if (id == Guid.Empty)
                return BadRequest("Missing token");

            var campaign = await _campaignService.GetCampaignByLandingId(id);

            if (campaign == null)
                return NotFound("Campaign not found");

            await _trackingService.SetLandingPageOpened(id);

            LandingHtml = campaign.LandingPage?.Content ?? "<h1>Landing page not available</h1>";

            return Page();
        }

    }
}
