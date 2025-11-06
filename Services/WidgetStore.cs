using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;
using ProjectMaVe.Data;

namespace ProjectMaVe.Services;

public class WidgetStore : IWidgetStore
{
    private readonly DBContext _db;


    public WidgetStore(DBContext dbContext)
    {
        _db = dbContext;
    }

    public async Task<bool> CreateWidgetAsync(Widget widget) 
    {
        await _db.Widgets.AddAsync(widget);                 // Tells EF to stage this widget for insertion
        return await _db.SaveChangesAsync() > 0;
        // SaveChangesAsync() commits the staged changes and returns the number of affected rows
        // This function returns true if the number of affected rows is more than 0 (which means that it succeeded)
    }

    public async Task<bool> DeleteWidgetAsync(int widget_id)
    {
        var currentWidget = await _db.Widgets.FindAsync(widget_id);          // Lookup widget in db
        if(currentWidget ==null) return false;                       // If not found, return false

        _db.Widgets.Remove(currentWidget);                             // If it is found, remove it
        return await _db.SaveChangesAsync() > 0;            // Same save changes as the previous function
    }

    public async Task<Widget?> GetWidgetAsync(int widget_id)
    {
        return await _db.Widgets.FindAsync(widget_id);              // Return the widget with that uid
    }

    public async Task<bool> UpdateWidgetAsync(int widget_id, Widget widget)
    {
        var existingWidget = await _db.Widgets.FindAsync(widget_id);  // Lookup widget in db
        if(existingWidget == null) return false;              // If not found, return false

        // UPDATE TO BE WIDGET FIELDS
        /*
        existingWidget.Sets = widget.Sets;
        existingWidget.Reps = widget.Reps;
        existingWidget.Weight = widget.Weight;
        */

        _db.Widgets.Update(existingWidget);                     // Stage changes
        return await _db.SaveChangesAsync() > 0;            // Same save changes as the first function
    }

    // make function to get all widgets associated with user
}
