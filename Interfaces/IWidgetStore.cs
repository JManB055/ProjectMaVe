using ProjectMaVe.Data;
using ProjectMaVe.Models;

namespace ProjectMaVe.Interfaces;

public interface IWidgetStore
{
    Task<bool> CreateWidgetAsync(Widget widget);

    Task<bool> DeleteWidgetAsync(int widget_id);

    Task<Widget?> GetWidgetAsync(int widget_id);

    Task<bool> UpdateWidgetAsync(int widget_id, Widget widget);
}
