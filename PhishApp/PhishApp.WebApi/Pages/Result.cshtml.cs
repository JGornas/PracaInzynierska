using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using PhishApp.WebApi.Services;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Pages
{
    public class ResultModel : PageModel
    {
        private readonly ITrackingService _trackingService;

        public ResultModel(ITrackingService trackingService)
        {
            _trackingService = trackingService;
        }

        public async Task<IActionResult> OnGetAsync(Guid id)
        {
            if (id == Guid.Empty)
                return BadRequest("Missing token");


            await _trackingService.SetFormSubmittedAsync(id);

            return Page();
        }
    }
}
