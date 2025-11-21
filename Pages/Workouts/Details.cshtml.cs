using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;

namespace ProjectMaVe.Pages.Workouts
{
    [IgnoreAntiforgeryToken]
    public class DetailsModel : PageModel
    {
        private readonly IWorkoutStore _workoutService;
        private readonly IExerciseStore _exerciseService;
        private readonly IWorkoutExerciseStore _workoutExerciseService;
        private readonly IAuthenticationService _auth;

        public DetailsModel(IAuthenticationService authService, IExerciseStore exerciseService, IWorkoutStore workoutService, IWorkoutExerciseStore workoutExerciseService)
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

        public async Task<IActionResult> OnPostDelete(int id)
        {
            // Delete workout from database
            var result = await _workoutService.DeleteWorkoutAsync(id);

            if(!result) return new JsonResult(new { success = false, message = "Error deleting workout" });

            return RedirectToPage("/Workouts/Index");
        }

        public async Task<JsonResult> OnPostSaveWorkoutExercises([FromBody] DetailsWorkoutRequest? request)
        {
            if (request?.Exercises == null)
            {
                return new JsonResult(new { success = false, message = "Invalid request" });
            }

            try
            {
                // Verify user is authenticated
                var user = await _auth.GetCurrentUser();
                if (user == null)
                    return new JsonResult(new { success = false, message = "Error with User identification" });

                var uid = user.UserID;
                if (uid <= 0)
                    return new JsonResult(new { success = false, message = "Invalid user ID" });


                // -------- Save Workout ---------

                // Translate Workout JSON to Model
                Workout inputWorkout = new Workout();
                inputWorkout.UserID = uid;
                inputWorkout.WorkoutDate = DateTime.Parse(request.WorkoutDate);

                var wid = request.WorkoutID ?? -1;

                // Save workout to database
                bool workoutId = await _workoutService.UpdateWorkoutAsync(wid, inputWorkout);
                if(!workoutId)
                    return new JsonResult(new { success = false, message = "Error with saving workout object" });


                // -------- Save WorkoutExercises ---------

                // Get old workoutExercises to know what needs to be added or deleted vs just changed
                var oldExercises = await _workoutExerciseService.GetWorkoutExercisesAsync(wid);
                if(oldExercises == null) return new JsonResult(new { success = false, message = "Error retrieving old workoutExercise list" });

                var newExercises = new List<WorkoutExercise>();

                // Change the input list to instances of the WorkoutExercise model
                foreach(var ex in request.Exercises) {
                    var currentExercise = new WorkoutExercise();  // Create new instance of WorkoutExercise model

                    // Copy all attributes in to new instance
                    currentExercise.WorkoutExerciseID = ex.WorkoutExerciseID;
                    currentExercise.WorkoutID = wid;
                    currentExercise.ExerciseID = ex.ExerciseID;
                    currentExercise.Sets = ex.Sets;
                    currentExercise.Reps = ex.Reps;
                    currentExercise.Weight = ex.Weight;
                    currentExercise.Distance = ex.Distance;
                    currentExercise.Time = ex.Duration;         // The fields are named differently, this is not a typo

                    newExercises.Add(currentExercise);
                }

                // Arrays to store each of the 3 cases in
                var toDeleteExercises = new List<WorkoutExercise>();
                var toChangeExercises = new List<WorkoutExercise>();
                var toAddExercises = new List<WorkoutExercise>();

                // Figure out which exercises have been removed
                foreach(var ex in oldExercises) {
                    bool exists = newExercises.Any(el => el.WorkoutExerciseID == ex.WorkoutExerciseID);
                    if(!exists) toDeleteExercises.Add(ex);
                }

                // Figure out which exercises have been added or need to be changed
                foreach(var ex in newExercises) {
                    if(ex.WorkoutExerciseID == 0){
                        toAddExercises.Add(ex);
                        break;
                    }

                    toChangeExercises.Add(ex);
                }


                // Delete workouts that are no longer part of this workout
                foreach(var ex in toDeleteExercises){
                    bool success = await _workoutExerciseService.DeleteWorkoutExerciseAsync(ex.WorkoutExerciseID);
                    if(!success) return new JsonResult(new { success = false, message = "Error deleting old workoutExercise" });
                }

                // Add workouts that have been added from the details page
                foreach(var ex in toAddExercises){
                    bool success = await _workoutExerciseService.CreateWorkoutExerciseAsync(ex);
                    if(!success) return new JsonResult(new { success = false, message = "Error adding new workoutExercise" });
                }

                // Update all other workouts
                foreach(var ex in toChangeExercises){
                    bool success = await _workoutExerciseService.UpdateWorkoutExerciseAsync(ex.WorkoutExerciseID, ex);
                    if(!success) return new JsonResult(new { success = false, message = "Error deleting old workoutExercise" });
                }


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
        public async Task<JsonResult> OnGetWorkoutExercisesAsync(int workoutId)
        {
            try
            {
                /*
                // Explicitly typed array fixes CS0826
                var exercises = new List<object>
                {
                    new { Exercise = "Bench Press", Muscle = "Chest", Sets = 4, Reps = 8, Weight = 185 },
                    new { Exercise = "Shoulder Press", Muscle = "Shoulders", Sets = 3, Reps = 10, Weight = 95 },
                    new { Exercise = "Running", Muscle = "Cardio", Duration = 30, Distance = 5 }
                };*/

                var workout = await _workoutService.GetWorkoutAsync(workoutId);

                var exercises = await _workoutExerciseService.GetWorkoutExercisesAsync(workout.WorkoutID);

                var Exercises = exercises.Select(e => new
                {
                    e.WorkoutExerciseID,
                    e.ExerciseID,
                    e.Sets,
                    e.Reps,
                    e.Weight,
                    e.Distance,
                    e.Time,
                    e.isCompleted
                }).ToList();

                return new JsonResult(new
                {
                    success = true,
                    workoutDate = DateTime.Today.ToString("yyyy-MM-dd"),
                    exercises = Exercises
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching workout exercises: {ex.Message}");
                return new JsonResult(new { success = false, message = "Failed to fetch exercises" });
            }
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
    }

    public class DetailsWorkoutRequest{
        public int? WorkoutID { get; set; }
        public string WorkoutDate { get; set; } = string.Empty;
        public List<DetailsExerciseData> Exercises { get; set; } = new();
    }

    public class DetailsExerciseData{
        public int WorkoutExerciseID { get; set; }
        public int ExerciseID { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public string MuscleGroup { get; set; } = string.Empty;
        public int? Sets { get; set; }
        public int? Reps { get; set; }
        public decimal? Weight { get; set; }
        public int? Duration { get; set; }
        public decimal? Distance { get; set; }
    }
}
