using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;
using ProjectMaVe.Data;
using Microsoft.EntityFrameworkCore;

namespace ProjectMaVe.Services;

public class WorkoutStore : IWorkoutStore
{
    private readonly DBContext _db;

    public WorkoutStore(DBContext dbContext)
    {
        _db = dbContext;
    }

// Possibly have this function return the db id for the created row?
    public async Task<int> CreateWorkoutAsync(Workout workout)
    {
        await _db.Workouts.AddAsync(workout);                 // Tells EF to stage this workout for insertion
        await _db.SaveChangesAsync();
        // SaveChangesAsync() commits the staged changes and returns the number of affected rows
        
        return workout.WorkoutID;
    }

    public async Task<bool> DeleteWorkoutAsync(int workout_id)
    {
        var currentWorkout = await _db.Workouts.FindAsync(workout_id);          // Lookup workout in db
        if(currentWorkout ==null) return false;                       // If not found, return false


        // Cascade delete all workout_exercises associated with this workout by sending a raw SQL query

        using var connection = _db.Database.GetDbConnection();  // Open a raw SQL connection from the DBContext
        await connection.OpenAsync();				// Wait for the connection to open?

        using var command = connection.CreateCommand();		// Create new command

        command.CommandText = "DELETE FROM workout_exercises WHERE workout_id = @WorkoutId";	// Set command text
        var workoutParam = command.CreateParameter();						// Create parameter for variable to prevent SQL injection
        workoutParam.ParameterName = "@WorkoutId";
        workoutParam.Value = workout_id;
        command.Parameters.Add(workoutParam);

        await command.ExecuteNonQueryAsync();			// Send the command to the db


        _db.Workouts.Remove(currentWorkout);                // Delete workout
        return await _db.SaveChangesAsync() > 0;            // Same save changes as the previous function
    }

    public async Task<Workout?> GetWorkoutAsync(int workout_id)
    {
        return await _db.Workouts.FindAsync(workout_id);              // Return the workout with that uid
    }

    public async Task<bool> UpdateWorkoutAsync(int workout_id, Workout workout)
    {
        var existingWorkout = await _db.Workouts.FindAsync(workout_id);  // Lookup workout in db
        if(existingWorkout == null) return false;              // If not found, return false

        existingWorkout.WorkoutDate = workout.WorkoutDate;

        _db.Workouts.Update(existingWorkout);                     // Stage changes
        return await _db.SaveChangesAsync() > 0;            // Same save changes as the first function
    }


    public async Task<List<Workout>> GetWorkoutsByUserAsync(int user_id)
    {
        return await _db.Workouts    // Return the workouts with that uid
            .Where(w => w.UserID == user_id)
            .ToListAsync();
    }
}
