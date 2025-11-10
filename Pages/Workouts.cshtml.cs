using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ProjectMaVe.Pages
{
    public class WorkoutsModel : PageModel{
        public async Task<JsonResult> OnGetWorkoutExercisesAsync(int workoutId){
				    Console.WriteLine("=== HIT OnGetWorkoutExercisesAsync ===");
				
				    if (workoutId <= 0)
				        return new JsonResult(new { success = false, message = "Invalid workout ID." });
				
				    var exercises = await _workoutService.GetWorkoutExercisesAsync(workoutId);
				    return new JsonResult(new { success = true, exercises });
				}
				
				public async Task<JsonResult> OnPostSaveWorkoutExercisesAsync([FromBody] SaveWorkoutExercisesRequest request){
				    Console.WriteLine("=== HIT OnPostSaveWorkoutExercisesAsync ===");
				
				    if (request == null || request.Exercises == null || request.Exercises.Count == 0)
				        return new JsonResult(new { success = false, message = "No exercises provided." });
				
				    bool success = await _workoutService.StoreWorkoutExercisesAsync(request.WorkoutID, request.Exercises);
				    return new JsonResult(new { success });
				}
			
    }

    public class SaveWorkoutExercisesRequest{
		    public int WorkoutID { get; set; }
		    public List<WorkoutExercise> Exercises { get; set; }
		}

}
