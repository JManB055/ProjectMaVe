using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ProjectMaVe.Interfaces; 
using ProjectMaVe.Models; 
using ProjectMaVe.APIs.Google_AI;

namespace ProjectMaVe.Pages
{
	[IgnoreAntiforgeryToken]
	
    public class WorkoutsModel : PageModel{
		private readonly IWorkoutExerciseStore _workoutExerciseService;
		private readonly IAIService _aiService;
		
		public WorkoutsModel(IWorkoutExerciseStore workoutExerciseService, IAIService aiService){
			_workoutExerciseService = workoutExerciseService;
			_aiService = aiService;
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
		
		public async Task<JsonResult> OnPostGeneratePlanAsync([FromBody] AIPromptRequest promptRequest){
			Console.WriteLine("=== HIT OnPostGeneratePlanAsync ===");
			
			if(promptRequest == null || string.IsNullOrWhiteSpace(promptRequest.Prompt))
				return new JsonResult(new { success = false, message = "Prompt is required." });
			
			string aiResponse = await _aiService.CallAIAsync(promptRequest.Prompt);
			
			return new JsonResult(new
			{
				success = true,
				plan = aiResponse
			});
		}
    }

    public class SaveWorkoutExercisesRequest{
		public int WorkoutID { get; set; }
		public List<WorkoutExercise> Exercises { get; set; }
	}
	
	public class AIPromptRequest{
		public string Prompt { get; set; }
	}
}
