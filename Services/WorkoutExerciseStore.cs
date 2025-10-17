using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;
using ProjectMaVe.Data;

namespace ProjectMaVe.Services;

public class WorkoutExerciseStore : IWorkoutExerciseStore
{
    private readonly DBContext _db;

    /*

    Consider how this differs from other store files

    Think about how exercises are created

    You want to add an exercise, and it will be associated with a workout. Possibly pass workout_id and uid?

    These will all go to the same table. Every exercise for every workout for every user is on one table.
    Each workout exercise will have a workout_id to tell you what workout it belongs to, and each workout exercise
    will have a uid to tell you who that workout exercise belongs to, although the workout itself will also have a
    uid to tell you who the full workout belongs to.

    The workout table is just there to give something for exercises to point to. It does not actually contain all 
    the exercises in each workout.

    */

    public WorkoutExerciseStore(DBContext dbContext)
    {
        _db = dbContext;
    }

    // Possibly return the id for the created workout exercise???
    public async Task<bool> CreateWorkoutExerciseAsync(WorkoutExercise workoutExercise) // The passed workoutExercise needs to have the ids for the workout and the user already in it. These will need to be retrieved and set when making the local object 
    {
        await _db.workout_exercises.AddAsync(workoutExercise);                 // Tells EF to stage this workout for insertion
        return await _db.SaveChangesAsync() > 0;    
        // SaveChangesAsync() commits the staged changes and returns the number of affected rows
        // This function returns true if the number of affected rows is more than 0 (which means that it succeeded)
    }

    public async Task<bool> DeleteWorkoutExerciseAsync(int workout_exercise_id)
    {
        var currentWorkout = await _db.workout_exercises.FindAsync(workout_exercise_id);          // Lookup workout in db
        if(currentWorkout ==null) return false;                       // If not found, return false

        _db.workout_exercises.Remove(currentWorkout);                             // If it is found, remove it
        return await _db.SaveChangesAsync() > 0;            // Same save changes as the previous function
    }

    public async Task<WorkoutInfo?> GetWorkoutExerciseAsync(int workout_id)
    {
        return await _db.workout_exercises.FindAsync(workout_id);              // Return the workout with that uid
    }

    public async Task<bool> UpdateWorkoutExerciseAsync(int workout_id, Workout workout)
    {
        var existingWorkout = await _db.workout_exercises.FindAsync(workout_id);  // Lookup workout in db
        if(existingWorkout == null) return false;              // If not found, return false

        existingWorkout.WorkoutDate = workout.WorkoutDate;
	// Also add any other fields that need to be copied

        _db.workout_exercises.Update(existingWorkout);                     // Stage changes
        return await _db.SaveChangesAsync() > 0;            // Same save changes as the first function
    }
}
