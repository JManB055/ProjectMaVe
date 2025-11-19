using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;

namespace ProjectMaVe.Pages.Workouts
{
    [IgnoreAntiforgeryToken]
    public class IndexModel : PageModel
    {
        private readonly IWorkoutStore _workoutService;
        private readonly IExerciseStore _exerciseService;
        private readonly IWorkoutExerciseStore _workoutExerciseService;
        private readonly IAuthenticationService _auth;

        public IndexModel(IAuthenticationService authService, IExerciseStore exerciseService, IWorkoutStore workoutService, IWorkoutExerciseStore workoutExerciseService)
        {
            _workoutService = workoutService;
            _exerciseService = exerciseService;
            _workoutExerciseService = workoutExerciseService;
            _auth = authService;
        }

        public async Task<IActionResult> OnGetAsync()
        {
            if (!_auth.IsCurrentSignedIn()) return Redirect("~/");
            return Page();
        }


        public async Task<JsonResult> OnGetExercisesAsync()
        {
            try
            {
                var user = await _auth.GetCurrentUser();

                if (user == null)
                    return new JsonResult(new { success = false, message = "Error with User identification" });

                var uid = user.UserID;

                if (uid <= 0)
                    return new JsonResult(new { success = false, message = "Invalid user ID" });

                var exercises = await _exerciseService.GetAllExercisesAsync();

                if (exercises == null)
                    return new JsonResult(new { success = false, message = "Error retrieving exercises" });

                var exerciseResults = exercises.Select(e => new {
                    e.ExerciseID,
                    e.Name,
                    e.MuscleGroup
                });

                return new JsonResult(new { success = true, exercises = exerciseResults });
            }
            catch (Exception ex)
            {
                return new JsonResult(new { success = false, message = ex.Message });
            }
        }

        public async Task<JsonResult> OnGetWorkoutInfoAsync()
        {
            try
            {
                var user = await _auth.GetCurrentUser();
                if (user == null)
                    return new JsonResult(new { success = false, message = "Error with User identification" });

                var uid = user.UserID;
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

        public async Task<JsonResult> OnPostDeleteWorkoutAsync([FromBody] DeleteWorkoutDto workout){
            var result = await _workoutService.DeleteWorkoutAsync(workout.wid);

            if(!result) return new JsonResult(new { success = false, message = "Error deleting workout" });

            return new JsonResult(new { success = true, message = "Workout deleted successfully" });
        }
    }

    public class DeleteWorkoutDto
    {
        public int wid { get; set; }
    }
}
