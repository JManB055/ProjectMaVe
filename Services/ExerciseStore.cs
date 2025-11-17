using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;
using ProjectMaVe.Data;

namespace ProjectMaVe.Services;

public class ExerciseStore : IExerciseStore
{
    private readonly DBContext _db;

    public ExerciseStore(DBContext dbContext)
    {
        _db = dbContext;
    }

	/// <summary>
	/// Find an exercise in the database based on the exercise ID
	/// </summary>
	/// <param name="exercise_id">Exercise ID</param>
	/// <returns>
	/// Exercise object
	/// </returns>
	/// <remarks>
	/// This function uses database context to return an exercise object based on a given exercise ID
	/// </remarks>
    public async Task<Exercise?> GetExerciseAsync(int exercise_id)
    {
        return await _db.Exercises.FindAsync(exercise_id);              // Return the exercise with that id
    }

	/// <summary>
	/// Find an exercise in the database based on the exercise name
	/// </summary>
	/// <param name="name">Exercise name</param>
	/// <returns>
	/// Exercise object
	/// </returns>
	/// <remarks>
	/// This function uses database context to return an exercise object based on a given exercise name
	/// </remarks>
    public Exercise? GetExerciseByName(string name)
    {
        return _db.Exercises.FirstOrDefault(e => e.Name == name);       // Return the exercise with that name
    }

    public async Task<List<Exercise>> GetAllExercisesAsync()
    {
        return await _context.Workouts.ToListAsync();
    }
    
    // This service does not need an add or delete function since it will be a static list of exercise options
}
