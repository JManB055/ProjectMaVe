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

            bool success = await _widgetService.StoreAllWidgetsAsync(request.UserID, request.Widgets);

            return new JsonResult(new { success });
        }

        public async Task<JsonResult> OnGetWidgetsAsync(int userId)
        {
            if (userId <= 0)
            {
                return new JsonResult(new { success = false, message = "Invalid user ID." });
            }

            var widgets = await _widgetService.GetWidgetsByUserAsync(userId);

            if (widgets == null || widgets.Count == 0)
            {
                return new JsonResult(new { success = true, widgets = new List<Widget>() });
            }

            return new JsonResult(new { success = true, widgets });
        }


    }

    public class SaveWidgetsRequest{
        public int UserID { get; set; }
        public List<Widget> Widgets { get; set; }
    }
}
