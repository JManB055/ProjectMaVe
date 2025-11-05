using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectMaVe.Models;

public class Exercise
{
    //default constructor
    public Exercise()
    {
    }

    //overloaded constructor
    public Exercise(Int32 guid, string name, string mgroup)
    {
        ExerciseID = guid;
        Name = name;
        MuscleGroup = mgroup;
    }

    [Column("exercise_id")]
    public Int32 ExerciseID { get; set; } = 0;

    [Column("name")]
    public string Name { get; set; } = "";

    [Column("muscle_group")]
    public string? MuscleGroup { get; set; } = "";

}
