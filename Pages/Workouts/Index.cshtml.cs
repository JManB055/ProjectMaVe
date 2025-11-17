using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;

namespace ProjectMaVe.Pages.Workouts
{
    public class IndexModel : PageModel
    {
        private readonly IWorkoutStore _workoutService;
        private readonly IWorkoutExerciseStore _workoutExerciseService;
        private readonly IAuthenticationService _auth;

        public IndexModel(IAuthenticationService authService, IWorkoutStore workoutService, IWorkoutExerciseStore workoutExerciseService)
        {
            _workoutService = workoutService;
            _workoutExerciseService = workoutExerciseService;
            _auth = authService;
        }

        public async Task<IActionResult> OnGetAsync()
        {
            if (!_auth.IsCurrentSignedIn()) return Redirect("~/");
            return Page();
        }

        public async Task<JsonResult> OnGetWorkoutInfoAsync()
        {
            try
            {
                var cookieInfo = _auth.GetCookieInfo();
                if (cookieInfo == null)
                    return new JsonResult(new { success = false, message = "Error with User identification" });

                var uid = cookieInfo.Value.uid;
                if (uid <= 0)
                    return new JsonResult(new { success = false, message = "Invalid user ID" });

                // Step 1: get all workouts for the user
                var workouts = await _workoutService.GetWorkoutsByUserAsync(uid);

                // Handle case of no workouts
                if (workouts == null)
                    return new JsonResult(new { success = false, message = "Error with user workouts retrieval" });

                // Step 2: fetch exercises for each workout
                var workoutResults = new List<object>();
                foreach (var workout in workouts)
                {
                    var exercises = await _workoutExerciseService.GetWorkoutExercisesAsync(workout.WorkoutID);

                    workoutResults.Add(new
                    {
                        workout.WorkoutID,
                        WorkoutDate = workout.WorkoutDate.ToString("yyyy-MM-dd"),
                        Exercises = exercises.Select(e => new
                        {
                            e.WorkoutExerciseID,
                            e.ExerciseID,
                            e.Sets,
                            e.Reps,
                            e.Weight,
                            e.Distance,
                            e.Time,
                            e.isCompleted
                        }).ToList()
                    });
                }

                // Step 3: return JSON
                return new JsonResult(new { success = true, workouts = workoutResults });
            }
            catch (Exception ex)
            {
                // Always return JSON, even on error
                return new JsonResult(new { success = false, message = ex.Message });
            }
        }
        public async Task<JsonResult> OnPostDeleteWorkoutAsync(int workoutID){
            var result = await _workoutService.DeleteWorkoutAsync(workoutID);

            if(!result) return new JsonResult(new { success = false, message = "Error deleting workout" });

            return new JsonResult(new { success = true, message = "Workout deleted successfully" });
        }
    }
}
