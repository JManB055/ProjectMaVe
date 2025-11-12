using Microsoft.EntityFrameworkCore;
using ProjectMaVe.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectMaVe.Models;


public class WorkoutExercise
{
    //default constructor
    public WorkoutExercise()
    {
    }

    //overloaded constructor
    public WorkoutExercise(Int32 guid, Int32 wuid, Int32 euid, float sets, float reps, float weight, float distance, float time, bool complete)
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
    public float Sets { get; set; } = 0;

    [Column("reps")]
    public float Reps { get; set; } = 0;

    [Column("weight")]
    public float Weight { get; set; } = 0;

    [Column("distance")]
    public float Distance { get; set; } = 0;

    [Column("time")]
    public float Time { get; set; } = 0;

    [Column("isCompleted")]
    public bool isCompleted { get; set; } = false;
}
