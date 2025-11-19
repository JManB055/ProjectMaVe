using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;
using ProjectMaVe.Data;
using Microsoft.EntityFrameworkCore;

namespace ProjectMaVe.Services;

public class WorkoutExerciseStore : IWorkoutExerciseStore
{
    private readonly DBContext _db;

    public WorkoutExerciseStore(DBContext dbContext)
    {
        _db = dbContext;
    }

	/// <summary>
	/// Add a single exercise to a workout
	/// </summary>
	/// <param name="workoutExercise">Workout exercise object</param>
	/// <returns>
	/// Boolean indicating success or failure
	/// </returns>
	/// <remarks>
	/// This function adds an existing exercise to a workout
	/// </remarks>
    public async Task<bool> CreateWorkoutExerciseAsync(WorkoutExercise workoutExercise)
    {
        // check if workout exists
        
        await _db.WorkoutExercises.AddAsync(workoutExercise);                 // Tells EF to stage this workout for insertion
        return await _db.SaveChangesAsync() > 0;
        // SaveChangesAsync() commits the staged changes and returns the number of affected rows
        // This function returns true if the number of affected rows is more than 0 (which means that it succeeded)
    }

	/// <summary>
	/// Removes a single exercise from a workout
	/// </summary>
	/// <param name="workout_exercise_id">Workout exercise ID</param>
	/// <returns>
	/// Boolean indicating success or failure
	/// </returns>
	/// <remarks>
	/// This function removes an exercise from a workout by the workout exercise ID
	/// </remarks>
    public async Task<bool> DeleteWorkoutExerciseAsync(int workout_exercise_id)
    {
        var currentWorkout = await _db.WorkoutExercises.FindAsync(workout_exercise_id);          // Lookup workout in db
        if(currentWorkout ==null) return false;                       // If not found, return false

        _db.WorkoutExercises.Remove(currentWorkout);                             // If it is found, remove it
        return await _db.SaveChangesAsync() > 0;            // Same save changes as the previous function
    }

	/// <summary>
	/// Gets a single exercise from a workout
	/// </summary>
	/// <param name="workout_exercise_id">Workout exercise ID</param>
	/// <returns>
	/// Workout exercise object
	/// </returns>
	/// <remarks>
	/// This function gets an existing exercise from a workout and returns it by the workout exercise ID
	/// </remarks>
    public async Task<WorkoutExercise?> GetWorkoutExerciseAsync(int workout_exercise_id)
    {
        return await _db.WorkoutExercises.FindAsync(workout_exercise_id);              // Return the workout with that uid
    }

	/// <summary>
	/// Updates a single exercise from a workout
	/// </summary>
	/// <param name="workout_id">Workout ID</param>
	/// <param name="workout">Workout exercise object</param>
	/// <returns>
	/// Boolean indicating success or failure
	/// </returns>
	/// <remarks>
	/// This function finds a workout by the ID and uses a workout exercise object to update an exercise within the workout
	/// </remarks>
    public async Task<bool> UpdateWorkoutExerciseAsync(int workout_id, WorkoutExercise workout)
    {
        var existingWorkout = await _db.WorkoutExercises.FindAsync(workout_id);  // Lookup workout in db
        if(existingWorkout == null) return false;              // If not found, return false

        existingWorkout.ExerciseID = workout.ExerciseID;
        existingWorkout.Sets = workout.Sets;
        existingWorkout.Reps = workout.Reps;
        existingWorkout.Weight = workout.Weight;
        existingWorkout.Distance = workout.Distance;
        existingWorkout.Time = workout.Time;
        existingWorkout.isCompleted = workout.isCompleted;

        _db.WorkoutExercises.Update(existingWorkout);                     // Stage changes
        return await _db.SaveChangesAsync() > 0;            // Same save changes as the first function
    }

	/// <summary>
	/// Saves a workout to database
	/// </summary>
	/// <param name="workout_id">Workout ID</param>
	/// <param name="newExercises">List of workout exercise objects</param>
	/// <returns>
	/// Boolean indicating success or failure
	/// </returns>
	/// <remarks>
	/// This function saves an entire set of exercises for a workout at once
	/// </remarks>
    public async Task<bool> StoreWorkoutExercisesAsync(int workoutId, List<WorkoutExercise> newExercises)
    {
        // Step 1: Pull existing exercises for this workout
        var existingExercises = await _db.WorkoutExercises
            .Where(e => e.WorkoutID == workoutId)
            .ToListAsync();

        // Step 2: Determine which exercises to delete
        var exercisesToDelete = existingExercises
            .Where(ee => !newExercises.Any(ne => ne.WorkoutExerciseID == ee.WorkoutExerciseID))
            .ToList();

        // Step 3: Determine which exercises to add
        var exercisesToAdd = newExercises
            .Where(ne => !existingExercises.Any(ee => ee.WorkoutExerciseID == ne.WorkoutExerciseID))
            .ToList();

        // Step 4: Determine which exercises to update
        var exercisesToUpdate = newExercises
            .Where(ne => existingExercises.Any(ee => ee.WorkoutExerciseID == ne.WorkoutExerciseID))
            .ToList();

        // --- Perform deletions ---
        if (exercisesToDelete.Any())
            _db.WorkoutExercises.RemoveRange(exercisesToDelete);

        // --- Perform additions ---
        if (exercisesToAdd.Any())
            await _db.WorkoutExercises.AddRangeAsync(exercisesToAdd);

        // --- Perform updates ---
        foreach (var exercise in exercisesToUpdate)
        {
            var existingExercise = existingExercises.First(ee => ee.WorkoutExerciseID == exercise.WorkoutExerciseID);
            existingExercise.Sets = exercise.Sets;
            existingExercise.Reps = exercise.Reps;
            existingExercise.Weight = exercise.Weight;
            existingExercise.Distance = exercise.Distance;
            existingExercise.Time = exercise.Time;
            existingExercise.isCompleted = exercise.isCompleted;
            existingExercise.ExerciseID = exercise.ExerciseID; // just in case
        }

        // --- Commit all changes at once ---
        return await _db.SaveChangesAsync() > 0;
    }

	/// <summary>
	/// Gets a workout from database
	/// </summary>
	/// <param name="workoutId">Workout ID</param>
	/// <returns>
	/// List of workout exercise objects
	/// </returns>
	/// <remarks>
	/// This function returns an entire workout by the workout ID as a list of workout exercise objects
	/// </remarks>
    public async Task<List<WorkoutExercise>> GetWorkoutExercisesAsync(int workoutId)
    {
        return await _db.WorkoutExercises
            .Where(e => e.WorkoutID == workoutId)
            .ToListAsync();
    }

}
