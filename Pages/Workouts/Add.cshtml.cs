using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Text.Json;

namespace ProjectMaVe.Pages.Workouts
{
    public class AddModel : PageModel
    {
        // TODO: Inject your database service/repository
        // private readonly IWorkoutRepository _workoutRepo;

        public void OnGet()
        {
            // Load page
        }

        // Handler to save a new workout with exercises
        public async Task<IActionResult> OnPostSaveWorkoutExercises([FromBody] SaveWorkoutRequest request)
        {
            try
            {
                // TODO: Verify user is authenticated
                // var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                // if (string.IsNullOrEmpty(userId)) 
                //     return new JsonResult(new { success = false, message = "Unauthorized" });

                // TODO: Save workout to database
                // var workoutId = await _workoutRepo.CreateWorkout(userId, request.WorkoutDate);

                // TODO: Save exercises to database
                // foreach (var exercise in request.Exercises)
                // {
                //     await _workoutRepo.AddExerciseToWorkout(workoutId, exercise);
                // }

                // Mock response for now
                return new JsonResult(new
                {
                    success = true,
                    message = "Workout saved successfully!",
                    workoutId = 123 // Return the new workout ID
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving workout: {ex.Message}");
                return new JsonResult(new
                {
                    success = false,
                    message = "Failed to save workout"
                });
            }
        }
    }

    // Request models
    public class SaveWorkoutRequest
    {
        public int? WorkoutID { get; set; } // null for new workouts
        public string WorkoutDate { get; set; }
        public List<ExerciseData> Exercises { get; set; }
    }

    public class ExerciseData
    {
        public string ExerciseName { get; set; }
        public string MuscleGroup { get; set; }
        public int? Sets { get; set; }
        public int? Reps { get; set; }
        public decimal? Weight { get; set; }
        public int? Duration { get; set; }
        public decimal? Distance { get; set; }
    }
}