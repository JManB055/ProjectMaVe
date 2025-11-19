using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectMaVe.Models;

/**
 * <summary>
 * Represents a widget on the user dashboard
 * </summary>
 * <remarks>
 * Widgets contain various different features, such as recent workouts or statistic graphs
 * </remarks>
 */
public class Widget
{
    //default constructor
    public Widget()
    {
    }

    //overloaded constructor
    public Widget(Int32 uid, Int32 posX, Int32 posY, string wtype, Int32 wwidth, Int32 wheight){
        userID = uid;
        x = posX;
        y = posY;
        type = wtype;
        w = wwidth;
        h = wheight;
    }

    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("widget_id")]
    public Int32 widgetID { get; set; } = 0;

    [Column("user_id")]
    public Int32 userID { get; set; } = 0;

    [Column("x")]
    public Int32 x { get; set; } = 0;

    [Column("y")]
    public Int32 y { get; set; } = 0;

    [Column("type")]
    public string type { get; set; } = "";

    [Column("width")]
    public Int32 w { get; set; } = 0;

    [Column("height")]
    public Int32 h { get; set; } = 0;
}
