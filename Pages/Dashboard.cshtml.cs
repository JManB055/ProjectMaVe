using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;

namespace ProjectMaVe.Pages
{
    [IgnoreAntiforgeryToken]
    public class DashboardModel : PageModel
    {
        private readonly IWidgetStore _widgetService;
        
        public DashboardModel(IWidgetStore widgetService)
        {
            _widgetService = widgetService;
        }

        public async Task<JsonResult> OnPostSaveWidgetsAsync([FromBody] SaveWidgetsRequest request)
  	  	{
  	  	    Console.WriteLine("=== HIT OnPostSaveWidgetsAsync ===");

            if (request == null || request.Widgets == null || request.Widgets.Count == 0)
  	  	    {
  	  	        return new JsonResult(new { success = false, message = "No widgets provided." });
  	  	    }
  	  	
  	  	    bool success = await _widgetService.StoreAllWidgetsAsync(request.UserID, request.Widgets);
  	  	
  	  	    return new JsonResult(new { success });
  	  	}
  	
    }

    public class SaveWidgetsRequest{
      public int UserID { get; set; }
      public List<Widget> Widgets { get; set; }
    }
}
