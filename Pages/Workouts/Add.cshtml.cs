using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;

namespace ProjectMaVe.Pages.Workouts
{
    public class AddModel : PageModel
    {
        private readonly IWorkoutStore _workoutService;
        private readonly IWorkoutExerciseStore _workoutExerciseService;
        private readonly IExerciseStore _exerciseService;
        private readonly IAuthenticationService _auth;

        public AddModel(IAuthenticationService authService, IExerciseStore exerciseService, IWorkoutStore workoutService, IWorkoutExerciseStore workoutExerciseService)
        {
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

        public async Task<JsonResult> OnGetExercisesAsync(){
            try
            {
                var cookieInfo = _auth.GetCookieInfo();
                if (cookieInfo == null)
                    return new JsonResult(new { success = false, message = "Error with User identification" });

                var uid = cookieInfo.Value.uid;
                if (uid <= 0)
                    return new JsonResult(new { success = false, message = "Invalid user ID" });

                // Step 1: get static exercise list
                var exercises = await _exerciseService.GetAllExercisesAsync(uid);

                // Handle case of no workouts
                if (exercises == null)
                    return new JsonResult(new { success = false, message = "Error with Exercise list retrieval" });

                // Step 2: fetch exercises for each workout
                var exerciseResults = new List<object>();
                foreach (var exercise in exercises)
                {
                    exerciseResults.Add(new
                    {
                        exercise.ExerciseID,
                        exercise.Name,
                        exercise.MuscleGroup,
                    });
                }

                // Step 3: return JSON
                return new JsonResult(new { success = true, exercises = exerciseResults });
            }
            catch (Exception ex)
            {
                // Always return JSON, even on error
                return new JsonResult(new { success = false, message = ex.Message });
            }
        }

        // Handler to save a new workout with exercises
        public async Task<IActionResult> OnPostSaveWorkoutExercisesAsync([FromBody] SaveWorkoutRequest request)
        {
            try
            {
                // Verify user is authenticated
                var cookieInfo = _auth.GetCookieInfo();
                if (cookieInfo == null)
                    return new JsonResult(new { success = false, message = "Error with User identification" });

                var uid = cookieInfo.Value.uid;
                if (uid <= 0)
                    return new JsonResult(new { success = false, message = "Invalid user ID" });



                // Translate Workout JSON to Model
                Workout newWorkout = new Workout();
                newWorkout.UserID = uid;
                newWorkout.WorkoutDate = request.workoutDate;

                // Save workout to database
                var workoutId = await _workoutService.CreateWorkoutAsync(newWorkout);
                if(workoutId == null)
                    return new JsonResult(new { success = false, message = "Error with saving new workout object" });



                // Translate WorkoutExercise JSON to Model
                List<WorkoutExercise> newExercises = new List<WorkoutExercise>();
                foreach (var e in request.exercises){
                    WorkoutExercise current = new WorkoutExercise();
                    current.WorkoutID = workoutId;
                    current.ExerciseID = e.exercise_id;
                    current.Sets = e.sets;
                    current.Reps = e.reps;
                    current.Weight = e.weight;
                    current.Distance = e.distance;
                    current.Time = e.duration;
                    
                    newExercises.Add(current);
                }

                // TODO: Save exercises to database
                var workoutExerciseStoreSuccess = await _workoutExerciseService.StoreWorkoutExercisesAsync(workoutId, newExercises);
                if(workoutExerciseStoreSuccess == null || workoutExerciseStoreSuccess == false)
                    return new JsonResult(new { success = false, message = "Error with saving new workout exercise objects" });

                

                // Return JSON result status if everything worked
                return new JsonResult(new { success = true });


                /*
                // Old mock response
                return new JsonResult(new
                {
                    success = true,
                    message = "Workout saved successfully!",
                    workoutId = 123 // Return the new workout ID
                });
                */
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
    }
}
