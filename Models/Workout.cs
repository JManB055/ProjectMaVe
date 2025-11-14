using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectMaVe.Models;


public class Workout
{
    //default constructor
    public Workout()
    {
    }

    //overloaded constructor
    public Workout(Int32 guid, Int32 uuid, DateTime date)
    {
        WorkoutID = guid;
        UserID = uuid;
        WorkoutDate = date;
    }

    [Column("workout_id")]
    public Int32 WorkoutID { get; set; } = 0;

    [Column("user_id")]
    public Int32 UserID { get; set; } = 0;

    [Column("workout_date")]
    public DateTime WorkoutDate { get; set; } = DateTime.MinValue;

}
