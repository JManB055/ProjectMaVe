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

    public Int32 ExerciseID { get; set; }

    public string Name { get; set; }

    public string? MuscleGroup { get; set; }

}