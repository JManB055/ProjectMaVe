using ProjectMaVe.Data;
using ProjectMaVe.Models;

namespace ProjectMaVe.Interfaces;

public interface IWidgetStore
{
    Task<bool> StoreAllWidgetsAsync(int user_id, List<Widget> newWidgets);

    Task<List<Widget>> GetWidgetsByUserAsync(int user_id);
}
