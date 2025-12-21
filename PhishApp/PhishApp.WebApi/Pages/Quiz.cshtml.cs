using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using PhishApp.WebApi.Models.Quizzes;
using PhishApp.WebApi.Services.Interfaces;

namespace PhishApp.WebApi.Pages
{
    [AllowAnonymous]
    public class QuizModel : PageModel
    {
        private readonly IQuizService _quizService;

        public QuizModel(IQuizService quizService)
        {
            _quizService = quizService;
        }

        public QuizDto? Quiz { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id is null || id == 0)
                return BadRequest("Missing token");

            try
            {
                Quiz = await _quizService.GetQuizAsync((int)id);
            }
            catch (KeyNotFoundException)
            {
                Quiz = null;
            }

            return Page();
        }

    }
}
