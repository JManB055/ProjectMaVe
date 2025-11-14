using ProjectMaVe.Data;
using ProjectMaVe.Models;

namespace ProjectMaVe.Interfaces;

public interface IWorkoutExerciseStore
{
    Task<bool> CreateWorkoutExerciseAsync(WorkoutExercise workoutExercise);

    Task<bool> DeleteWorkoutExerciseAsync(int workout_exercise_id);

    Task<WorkoutExercise?> GetWorkoutExerciseAsync(int workout_exercise_id);

    Task<bool> UpdateWorkoutExerciseAsync(int workout_id, WorkoutExercise workout);

    Task<bool> StoreWorkoutExercisesAsync(int workout_id, List<WorkoutExercise> newExercises);

    Task<List<WorkoutExercise>> GetWorkoutExercisesAsync(int workout_id);
}
