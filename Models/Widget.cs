using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectMaVe.Models;


public class Workout
{
    //default constructor
    public Widget()
    {
    }

    //overloaded constructor
    public Widget(Int32 wid, Int32 uid, Int32 posX, Int32 posY, string wtype, Int32 wwidth, Int32 wheight){
        WidgetID = wid;
        UserID = uid;
        X = posX;
        Y = posY;
        Type = wtype;
        Width = wwidth;
        Height = wheight;
    }

    [Column("widget_id")]
    public Int32 WidgetID { get; set; } = 0;

    [Column("user_id")]
    public Int32 UserID { get; set; } = 0;

    [Column("x")]
    public Int32 X { get; set; } = 0;

    [Column("y")]
    public Int32 Y { get; set; } = 0;

    [Column("type")]
    public string Type { get; set; } = "";

    [Column("width")]
    public Int32 Width { get; set; } = 0;

    [Column("height")]
    public Int32 Height { get; set; } = 0;
}
