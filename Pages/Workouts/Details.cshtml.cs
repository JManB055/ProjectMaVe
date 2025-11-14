using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ProjectMaVe.Pages.Workouts
{
    [IgnoreAntiforgeryToken]
    public class DetailsModel : PageModel
    {
        public void OnGet(int id)
        {
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

        public async Task<JsonResult> OnPostSaveWorkoutExercises([FromBody] SaveWorkoutRequest? request)
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

        // ===== API HANDLER =====
        public async Task<JsonResult> OnGetWorkoutExercises(int workoutId)
        {
            try
            {
                // Explicitly typed array fixes CS0826
                var exercises = new List<object>
                {
                    new { Exercise = "Bench Press", Muscle = "Chest", Sets = 4, Reps = 8, Weight = 185 },
                    new { Exercise = "Shoulder Press", Muscle = "Shoulders", Sets = 3, Reps = 10, Weight = 95 },
                    new { Exercise = "Running", Muscle = "Cardio", Duration = 30, Distance = 5 }
                };

                return new JsonResult(new
                {
                    success = true,
                    workoutDate = DateTime.Today.ToString("yyyy-MM-dd"),
                    exercises
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching workout exercises: {ex.Message}");
                return new JsonResult(new { success = false, message = "Failed to fetch exercises" });
            }
        }
    }
}
