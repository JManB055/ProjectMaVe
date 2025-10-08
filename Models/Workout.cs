namespace ProjectMaVe.Models;


public class Workout
{
    //default constructor
    public Workout()
    {
    }

    //overloaded constructor
    public Workout(Int32 guid, Int32 uuid, string date)
    {
        WorkoutID = guid;
        UserID = uuid;
        WorkoutDate = date;
    }

    public Int32 WorkoutID { get; set; }

    public Int32 UserID { get; set; }

    public string WorkoutDate { get; set; }

}