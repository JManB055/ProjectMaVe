using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;
using ProjectMaVe.Data;
using ProjectMaVe.APIs.Google_AI;

namespace ProjectMaVe.Pages
{
    [IgnoreAntiforgeryToken]

        public class WorkoutsModel : PageModel{
        private readonly IWorkoutExerciseStore _workoutExerciseService;
        private readonly IAIService _aiService;
        private readonly DBContext _db;


        public WorkoutsModel(IWorkoutExerciseStore workoutExerciseService, IAIService aiService, DBContext db){
            _workoutExerciseService = workoutExerciseService;
            _aiService = aiService;
            _db = db;
        }

        public async Task<JsonResult> OnGetWorkoutExercisesAsync(int workoutId){
            if (workoutId <= 0)
                return new JsonResult(new { success = false, message = "Invalid workout ID." });

            var exercises = await _workoutExerciseService.GetWorkoutExercisesAsync(workoutId);
            return new JsonResult(new { success = true, exercises });
        }

        public async Task<JsonResult> OnPostSaveWorkoutExercisesAsync([FromBody] SaveWorkoutExercisesRequest request){
            if (request == null || request.Exercises == null || request.Exercises.Count == 0)
                return new JsonResult(new { success = false, message = "No exercises provided." });

            bool success = await _workoutExerciseService.StoreWorkoutExercisesAsync(request.WorkoutID, request.Exercises);
            return new JsonResult(new { success });
        }

        public async Task<JsonResult> OnPostGeneratePlanAsync([FromBody] AIPromptRequest promptRequest){
            if(promptRequest == null || string.IsNullOrWhiteSpace(promptRequest.Prompt))
                return new JsonResult(new { success = false, message = "Prompt is required." });

            string aiResponse = await _aiService.CallAIAsync(promptRequest.Prompt);

            return new JsonResult(new
            {
                success = true,
                plan = aiResponse
            });
        }

        public async Task<JsonResult> OnGetExercisesAsync(){
            var exercises = await _db.Exercises.ToListAsync();
            return new JsonResult(new { success = true, exercises });
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
