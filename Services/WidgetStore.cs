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

    // Store all widgets associated with user
    public async Task<bool> StoreAllWidgetsAsync(int user_id, List<Widget> newWidgets){
        // Step 1: Pull existing widgets from the database
		    var existingWidgets = await _db.Widgets
		        .Where(w => w.userID == user_id)
		        .ToListAsync();
		
		    // Step 2: Find which widgets to delete
		    var widgetsToDelete = existingWidgets
		        .Where(ew => !newWidgets.Any(nw => nw.widget_id == ew.widget_id))
		        .ToList();
		
		    // Step 3: Find which widgets to add
		    var widgetsToAdd = newWidgets
		        .Where(nw => !existingWidgets.Any(ew => ew.widget_id == nw.widget_id))
		        .ToList();
		
		    // Step 4: Find which widgets to update (same ID, changed properties)
		    var widgetsToUpdate = newWidgets
		        .Where(nw => existingWidgets.Any(ew => ew.widget_id == nw.widget_id))
		        .ToList();
		    // --- Perform Deletions ---
		    if (widgetsToDelete.Any())
		        _db.Widgets.RemoveRange(widgetsToDelete);
		
		    // --- Perform Additions ---
		    if (widgetsToAdd.Any())
		        await _db.Widgets.AddRangeAsync(widgetsToAdd);
		
		    // --- Perform Updates ---
		    foreach (var widget in widgetsToUpdate)
		    {
		        var existingWidget = existingWidgets.First(ew => ew.widget_id == widget.widget_id);
		        existingWidget.x = widget.x;
		        existingWidget.y = widget.y;
		        existingWidget.w = widget.w;
		        existingWidget.h = widget.h;
		        existingWidget.type = widget.type;
		    }
		
		    // --- Commit all changes in one go ---
		    return await _db.SaveChangesAsync() > 0;
		}

    // Get all widgets associated with user
    public async Task<List<Widget>> GetWidgetsByUserAsync(int user_id)
    {
        return await _db.Widgets
            .Where(w => w.userID == user_id)
            .ToListAsync();
    }

}
