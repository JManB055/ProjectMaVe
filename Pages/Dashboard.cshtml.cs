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
        private readonly IAuthenticationService _auth;

        public DashboardModel(IWidgetStore widgetService, IAuthenticationService authService)
        {
            _widgetService = widgetService;
            _auth = authService;
        }

        public async Task<IActionResult> OnGetAsync()
        {
            if (!_auth.IsCurrentSignedIn()) return Redirect("~/");
            return Page();
        }

        public async Task<JsonResult> OnPostSaveWidgetsAsync([FromBody] SaveWidgetsRequest request)
        {
            if (request == null || request.Widgets == null || request.Widgets.Count == 0)
            {
                return new JsonResult(new { success = false, message = "No widgets provided." });
            }

            bool success = await _widgetService.StoreAllWidgetsAsync(userID, request.Widgets);

            return new JsonResult(new { success });
        }

        public async Task<JsonResult> OnGetWidgetsAsync()
        {
            var cookieInfo = _auth.GetCookieInfo();

            if(cookieInfo != null){
                var uid = cookieInfo.Value.uid;
                Console.WriteLine($"User ID set: {userID}");
            
		            if (uid <= 0)
		            {
		                return new JsonResult(new { success = false, message = $"Invalid user ID. UserID={uid}" });
		            }
		
		            var widgets = await _widgetService.GetWidgetsByUserAsync(uid);
		
		            if (widgets == null || widgets.Count == 0)
		            {
		                return new JsonResult(new { success = true, widgets = new List<Widget>() });
		            }
		
		            return new JsonResult(new { success = true, widgets });
            }
            else{
                Console.WriteLine("Error with cookie retrieval");
		            return new JsonResult(new { success = false, message = $"Error with User identification" });
            }
        }


    }

    public class SaveWidgetsRequest{
        public int UserID { get; set; }
        public List<Widget> Widgets { get; set; }
    }
}
