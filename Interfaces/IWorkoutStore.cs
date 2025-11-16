using ProjectMaVe.Data;
using ProjectMaVe.Models;

namespace ProjectMaVe.Interfaces;

public interface IWorkoutStore
{
    Task<bool> CreateWorkoutAsync(Workout workout);

    Task<bool> DeleteWorkoutAsync(int workout_id);

    Task<Workout?> GetWorkoutAsync(int workout_id);

    Task<bool> UpdateWorkoutAsync(int workout_id, Workout workout);

    Task<List<Workout>> GetWorkoutsByUserAsync(int user_id);
}
