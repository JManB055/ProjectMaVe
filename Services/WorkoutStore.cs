using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;
using ProjectMaVe.Data;

namespace ProjectMaVe.Services;

public class WorkoutStore : IWorkoutStore
{
    private readonly DBContext _db;

    public WorkoutStore(DBContext dbContext)
    {
        _db = dbContext;
    }

// Possibly have this function return the db id for the created row?    
    public async Task<bool> CreateWorkoutAsync(Workout workout)
    {
        await _db.workouts.AddAsync(workout);                 // Tells EF to stage this workout for insertion
        return await _db.SaveChangesAsync() > 0;    
        // SaveChangesAsync() commits the staged changes and returns the number of affected rows
        // This function returns true if the number of affected rows is more than 0 (which means that it succeeded)
    }

    public async Task<bool> DeleteWorkoutAsync(int workout_id)
    {
        var currentWorkout = await _db.workouts.FindAsync(workout_id);          // Lookup workout in db
        if(currentWorkout ==null) return false;                       // If not found, return false

        _db.workouts.Remove(currentWorkout);                             // If it is found, remove it
        return await _db.SaveChangesAsync() > 0;            // Same save changes as the previous function
    }

    public async Task<WorkoutInfo?> GetWorkoutAsync(int workout_id)
    {
        return await _db.workouts.FindAsync(workout_id);              // Return the workout with that uid
    }

    public async Task<bool> UpdateWorkoutAsync(int workout_id, Workout workout)
    {
        var existingWorkout = await _db.workouts.FindAsync(workout_id);  // Lookup workout in db
        if(existingWorkout == null) return false;              // If not found, return false

        existingWorkout.WorkoutDate = workout.WorkoutDate;
	// Add other fields?

        _db.workouts.Update(existingWorkout);                     // Stage changes
        return await _db.SaveChangesAsync() > 0;            // Same save changes as the first function
    }
}
