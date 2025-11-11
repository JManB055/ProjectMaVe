using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ProjectMaVe.Pages.Workouts
{
    public class DetailsModel : PageModel
    {
        public void OnGet(int id)
        {
            // TODO: Fetch workout by ID from database
        }

        public IActionResult OnPost(int id)
        {
            // TODO: Update workout in database
            return RedirectToPage("/Workouts/Details", new { id = id });
        }

        public IActionResult OnPostDelete(int id)
        {
            // TODO: Delete workout from database
            return RedirectToPage("/Workouts/Index");
        }
    }
}