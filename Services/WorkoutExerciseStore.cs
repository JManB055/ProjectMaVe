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

    public async Task<bool> CreateWorkoutExerciseAsync(WorkoutExercise workoutExercise)
    {
        // check if workout exists
        
        await _db.WorkoutExercises.AddAsync(workoutExercise);                 // Tells EF to stage this workout for insertion
        return await _db.SaveChangesAsync() > 0;
        // SaveChangesAsync() commits the staged changes and returns the number of affected rows
        // This function returns true if the number of affected rows is more than 0 (which means that it succeeded)
    }

    public async Task<bool> DeleteWorkoutExerciseAsync(int workout_exercise_id)
    {
        var currentWorkout = await _db.WorkoutExercises.FindAsync(workout_exercise_id);          // Lookup workout in db
        if(currentWorkout ==null) return false;                       // If not found, return false

        _db.WorkoutExercises.Remove(currentWorkout);                             // If it is found, remove it
        return await _db.SaveChangesAsync() > 0;            // Same save changes as the previous function
    }

    public async Task<WorkoutExercise?> GetWorkoutExerciseAsync(int workout_exercise_id)
    {
        return await _db.WorkoutExercises.FindAsync(workout_exercise_id);              // Return the workout with that uid
    }

    public async Task<bool> UpdateWorkoutExerciseAsync(int workout_id, WorkoutExercise workout)
    {
        var existingWorkout = await _db.WorkoutExercises.FindAsync(workout_id);  // Lookup workout in db
        if(existingWorkout == null) return false;              // If not found, return false

        existingWorkout.Sets = workout.Sets;
        existingWorkout.Reps = workout.Reps;
        existingWorkout.Weight = workout.Weight;
        existingWorkout.Distance = workout.Distance;
        existingWorkout.Time = workout.Time;
        existingWorkout.isCompleted = workout.isCompleted;

        _db.WorkoutExercises.Update(existingWorkout);                     // Stage changes
        return await _db.SaveChangesAsync() > 0;            // Same save changes as the first function
    }
}
