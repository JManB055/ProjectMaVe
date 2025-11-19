using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;
using ProjectMaVe.Data;
using Microsoft.EntityFrameworkCore;

namespace ProjectMaVe.Services;

public class WidgetStore : IWidgetStore
{
    private readonly DBContext _db;
    private readonly ILogger<WidgetStore> _logger;

    public WidgetStore(DBContext dbContext, ILogger<WidgetStore> logger)
    {
        _db = dbContext;
        _logger = logger;
    }

    /// <summary>
	/// Store user widget configuration in the database
	/// </summary>
	/// <param name="user_id">User ID</param>
	/// <param name="newWidgets">List of widgets</param>
	/// <returns>
	/// Boolean indicating success or failure
	/// </returns>
	/// <remarks>
	/// This function takes the state of the widgets used by the user and updates the database accordingly
	/// </remarks>
    public async Task<bool> StoreAllWidgetsAsync(int user_id, List<Widget> newWidgets){
        // Step 1: Pull existing widgets from the database
        var existingWidgets = await _db.Widgets
            .Where(w => w.userID == user_id)
            .ToListAsync();

        // Step 2: Find which widgets to delete
        var widgetsToDelete = existingWidgets
            .Where(ew => !newWidgets.Any(nw => nw.widgetID == ew.widgetID))
            .ToList();

        // Step 3: Find which widgets to add
        var widgetsToAdd = newWidgets
            .Where(nw => nw.widgetID == 0 || !existingWidgets.Any(ew => ew.widgetID == nw.widgetID))
            .ToList();
        widgetsToAdd.ForEach(nw => nw.userID = user_id);

        // Step 4: Find which widgets to update (same ID, changed properties)
        var widgetsToUpdate = newWidgets
            .Where(nw => existingWidgets.Any(ew => ew.widgetID == nw.widgetID))
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
            var existingWidget = existingWidgets.First(ew => ew.widgetID == widget.widgetID);
            existingWidget.x = widget.x;
            existingWidget.y = widget.y;
            existingWidget.w = widget.w;
            existingWidget.h = widget.h;
            existingWidget.type = widget.type;
        }

        // --- Commit all changes in one go ---
        return await _db.SaveChangesAsync() > 0;
    }

    /// <summary>
	/// Return user widget configuration from the database
	/// </summary>
	/// <param name="user_id">User ID</param>
	/// <returns>
	/// List of widgets the user has on their dashboard
	/// </returns>
	/// <remarks>
	/// This function gets the state of the widgets associated with a user ID and returns them as a list
	/// </remarks>
    public async Task<List<Widget>> GetWidgetsByUserAsync(int user_id)
    {
        return await _db.Widgets
            .Where(w => w.userID == user_id)
            .ToListAsync();
    }

}
