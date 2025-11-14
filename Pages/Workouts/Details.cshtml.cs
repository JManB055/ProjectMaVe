using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ProjectMaVe.Pages.Workouts
{
    [IgnoreAntiforgeryToken] // apply to class, not method
    public class DetailsModel : PageModel
    {
        public void OnGet(int id)
        {
            // TODO: Fetch workout by ID from database
        }

        public IActionResult OnPost(int id)
        {
            // TODO: Update workout in database
            return RedirectToPage("/Workouts/Details", new { id });
        }

        public IActionResult OnPostDelete(int id)
        {
            // TODO: Delete workout from database
            return RedirectToPage("/Workouts/Index");
        }

        public async Task<JsonResult> OnPostSaveWorkoutExercises([FromBody] SaveWorkoutRequest request)
        {
            if (request?.Exercises == null)
            {
                return new JsonResult(new { success = false, message = "Invalid request" });
            }

            try
            {
                // TODO: Save workout and exercises to database
                return new JsonResult(new
                {
                    success = true,
                    message = "Workout saved successfully!",
                    workoutId = request.WorkoutID
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving workout: {ex.Message}");
                return new JsonResult(new { success = false, message = "Failed to save workout" });
            }
        }
    }
}
