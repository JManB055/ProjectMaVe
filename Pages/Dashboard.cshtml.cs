using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;

namespace ProjectMaVe.Pages
{
    [IgnoreAntiforgeryToken]
    public class DashboardModel : PageModel
    {
        private readonly IWidgetStore _widgetService;
        private readonly IWorkoutStore _workoutService;
        private readonly IWorkoutExerciseStore _workoutExerciseService;
        private readonly IExerciseStore _exerciseService;
        private readonly IAuthenticationService _auth;

        public DashboardModel(IWidgetStore widgetService, IAuthenticationService authService, IWorkoutStore workoutService, IWorkoutExerciseStore workoutExerciseService, IExerciseStore exerciseService)
        {
            _widgetService = widgetService;
            _workoutService = workoutService;
            _workoutExerciseService = workoutExerciseService;
            _exerciseService = exerciseService;
            _auth = authService;
        }

        public async Task<IActionResult> OnGetAsync()
        {
            if (!_auth.IsCurrentSignedIn()) return Redirect("~/");
            return Page();
        }

        public async Task<JsonResult> OnPostSaveWidgetsAsync([FromBody] List<Widget> widgets)
        {
            var user = await _auth.GetCurrentUser();

            if (user is null) {
                return new JsonResult(new { success = false, message = $"Error with User identification" });
            }

            var uid = user.UserID;
            if (uid <= 0)
            {
                return new JsonResult(new { success = false, message = "Invalid user ID" });
            }

            if (widgets == null || widgets.Count == 0)
            {
                return new JsonResult(new { success = false, message = "No widgets provided." });
            }

            bool success = await _widgetService.StoreAllWidgetsAsync(uid, widgets);
            return new JsonResult(new { success });
        }

        public async Task<JsonResult> OnGetWidgetsAsync()
        {
            var user = await _auth.GetCurrentUser();

            if (user is null)
            {
                return new JsonResult(new { success = false, message = $"Error with User identification" });
            }

            var uid = user.UserID;
            if (uid <= 0)
            {
                return new JsonResult(new { success = false, message = "Invalid user ID" });
            }

            var widgets = await _widgetService.GetWidgetsByUserAsync(uid);
            if (widgets == null || widgets.Count == 0)
            {
                return new JsonResult(new { success = true, widgets = new List<Widget>() });
            }

            return new JsonResult(new { success = true, widgets });
        }

        public async Task<JsonResult> OnGetWorkoutInfoAsync()
        {
            try
            {
                var user = await _auth.GetCurrentUser();
                if (user is null)
                    return new JsonResult(new { success = false, message = "Error with User identification" });

                var uid = user.UserID;
                if (uid <= 0)
                    return new JsonResult(new { success = false, message = "Invalid user ID" });

                // Step 1: get all workouts for the user
                var workouts = await _workoutService.GetWorkoutsByUserAsync(uid);

                // Handle case of no workouts
                if (workouts == null || workouts.Count == 0)
                    return new JsonResult(new { success = true, workouts = new List<object>() });

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

        public async Task<JsonResult> OnGetExerciseInfoAsync()
        {
            try
            {
                var exercises = await _exerciseService.GetExercisesAsync();
                if (exercises == null || exercises.Count == 0)
                {
                    return new JsonResult(new { success = true, exercises = new List<Exercise>() });
                }

                return new JsonResult(new { success = true, exercises });
            }
            catch (Exception ex)
            {
                return new JsonResult(new { success = false, message = ex.Message });
            }
        }
    }
}
