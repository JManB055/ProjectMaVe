using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ProjectMaVe.Interfaces; 
using ProjectMaVe.Models; 

namespace ProjectMaVe.Pages
{
		[IgnoreAntiforgeryToken]
    public class WorkoutsModel : PageModel{
				private readonly IWorkoutExerciseStore _workoutExerciseService;

				public WorkoutsModel(IWorkoutExerciseStore workoutExerciseService){
						_workoutExerciseService = workoutExerciseService;
				}

        public async Task<JsonResult> OnGetWorkoutExercisesAsync(int workoutId){
				    Console.WriteLine("=== HIT OnGetWorkoutExercisesAsync ===");
				
				    if (workoutId <= 0)
				        return new JsonResult(new { success = false, message = "Invalid workout ID." });
				
				    var exercises = await _workoutExerciseService.GetWorkoutExercisesAsync(workoutId);
				    return new JsonResult(new { success = true, exercises });
				}
				
				public async Task<JsonResult> OnPostSaveWorkoutExercisesAsync([FromBody] SaveWorkoutExercisesRequest request){
				    Console.WriteLine("=== HIT OnPostSaveWorkoutExercisesAsync ===");
				
				    if (request == null || request.Exercises == null || request.Exercises.Count == 0)
				        return new JsonResult(new { success = false, message = "No exercises provided." });
				
				    bool success = await _workoutExerciseService.StoreWorkoutExercisesAsync(request.WorkoutID, request.Exercises);
				    return new JsonResult(new { success });
				}
			
    }

    public class SaveWorkoutExercisesRequest{
		    public int WorkoutID { get; set; }
		    public List<WorkoutExercise> Exercises { get; set; }
		}

}
