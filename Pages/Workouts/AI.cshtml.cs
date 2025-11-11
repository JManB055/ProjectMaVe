using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ProjectMaVe.Pages.Workouts
{
    public class AIModel : PageModel
    {
        public void OnGet()
        {
            // Load AI planner page
        }

        public async Task<IActionResult> OnPostGeneratePlan()
        {
            // TODO: Call Google AI Studio API
            // Return JSON result for frontend to display

            return new JsonResult(new
            {
                success = true,
                plan = "Generated plan data"
            });
        }

        public IActionResult OnPostSavePlan()
        {
            // TODO: Save generated plan to database
            return RedirectToPage("/Workouts/Index");
        }
    }
}