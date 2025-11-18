using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;
using ProjectMaVe.Data;
using Microsoft.EntityFrameworkCore;

namespace ProjectMaVe.Services;

public class ExerciseStore : IExerciseStore
{
    private readonly DBContext _db;

    public ExerciseStore(DBContext dbContext)
    {
        _db = dbContext;
    }

    public async Task<Exercise?> GetExerciseAsync(int exercise_id)
    {
        return await _db.Exercises.FindAsync(exercise_id);              // Return the exercise with that id
    }

    public Exercise? GetExerciseByName(string name)
    {
        return _db.Exercises.FirstOrDefault(e => e.Name == name);       // Return the exercise with that name
    }

    public async Task<List<Exercise>> GetExercisesAsync()
    {
        return await _db.Exercises
            .ToListAsync();
    }


    // This service does not need an add or delete function since it will be a static list of exercise options
}
