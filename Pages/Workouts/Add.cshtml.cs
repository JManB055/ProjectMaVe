using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ProjectMaVe.Pages.Workouts
{
    public class AddModel : PageModel
    {
        public void OnGet()
        {
            // Load any initial data needed for the form
        }

        public IActionResult OnPost()
        {
            // TODO: Save workout to database
            // Redirect to Index after successful save
            return RedirectToPage("/Workouts/Index");
        }
    }
}