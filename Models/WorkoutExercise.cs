using Microsoft.EntityFrameworkCore;
using ProjectMaVe.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectMaVe.Models;

/**
 * <summary>
 * Represents an exercise as part of a workout
 * </summary>
 * <remarks>
 * Weight based and duration based exercises have different fields, this object can produce either one
 * </remarks>
 */
public class WorkoutExercise
{
    //default constructor
    public WorkoutExercise()
    {
    }

    //overloaded constructor
    public WorkoutExercise(Int32 guid, Int32 wuid, Int32 euid, int sets, int reps, decimal weight, int distance, int time, bool complete)
    {
        WorkoutExerciseID = guid;
        WorkoutID = wuid;
        ExerciseID = euid;
        Sets = sets;
        Reps = reps;
        Weight = weight;
        Distance = distance;
        Time = time;
        isCompleted = complete;
    }

    [Column("workout_exercise_id")]
    public Int32 WorkoutExerciseID { get; set; } = 0;

    [Column("workout_id")]
    public Int32 WorkoutID { get; set; } = 0;

    [Column("exercise_id")]
    public Int32 ExerciseID { get; set; } = 0;

    [Column("sets")]
    public int? Sets { get; set; } = 0;

    [Column("reps")]
    public int? Reps { get; set; } = 0;

    [Column("weight")]
    public decimal? Weight { get; set; } = 0;

    [Column("distance")]
    public decimal? Distance { get; set; } = 0;

    [Column("time")]
    public int? Time { get; set; } = 0;

    [Column("isCompleted")]
    public bool isCompleted { get; set; } = false;
}
