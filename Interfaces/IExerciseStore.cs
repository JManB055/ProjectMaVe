using ProjectMaVe.Data;
using ProjectMaVe.Models;

namespace ProjectMaVe.Interfaces;

public interface IExerciseStore
{
    Task<Exercise?> GetExerciseAsync(int exercise_id);

    Exercise? GetExerciseByName(string name);

    Task<List<Exercise>> GetAllExercisesAsync();
    Task<List<Exercise>> GetExercisesAsync();
}
