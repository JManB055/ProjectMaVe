using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ProjectMaVe.Pages
{
    public class LogOutModel : PageModel
    {
        public async Task<IActionResult> OnGet()
        {
            Response.Cookies.Append(Constants.COOKIE_TOKEN_FIELD, "");
            Response.Cookies.Append(Constants.COOKIE_ID_FIELD, "");

            return Page();
        }

    }
}
