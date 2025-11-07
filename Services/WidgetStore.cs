using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;
using ProjectMaVe.Data;
using Microsoft.EntityFrameworkCore;

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

        existingWidget.x = widget.x;
        existingWidget.y = widget.y;
        existingWidget.w = widget.w;
        existingWidget.h = widget.h;
        existingWidget.type = widget.type;

        _db.Widgets.Update(existingWidget);                     // Stage changes
        return await _db.SaveChangesAsync() > 0;            // Same save changes as the first function
    }

    // Get all widgets associated with user
    public async Task<List<Widget>> GetWidgetsByUserAsync(int user_id)
    {
        return await _db.Widgets
            .Where(w => w.userID == user_id)
            .ToListAsync();
    }

}
