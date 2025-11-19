using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;
using ProjectMaVe.Interfaces;

namespace ProjectMaVe.Pages
{

    public class LoginModel : PageModel
    {
        [BindProperty]
        [Required(ErrorMessage = "Please enter your email.")]
        public string Email { get; set; }

        [BindProperty]
        [Required(ErrorMessage = "Please enter your password.")]
        public string Password { get; set; }

        public string Message { get; set; }

        public void OnGet()
        {
        }

        public async Task<IActionResult> OnPostLogIn()
        {
            if (Email == null)
            {
                Message = "The User Name field is empty.";
                ModelState.AddModelError(String.Empty, "Invalid login attempt.");
                return Page();
            }
            if (Password == null)
            {
                Message = "The Password field is empty.";
                ModelState.AddModelError(String.Empty, "Invalid login attempt.");
                return Page();
            }

            var loginService = HttpContext.RequestServices.GetService<IAuthenticationService>();

            var nullableInfo = loginService.SignIn(Email, Password);
            if (nullableInfo == null)
            {
                Message = "Login Failed.";
                ModelState.AddModelError(String.Empty, "Invalid login attempt.");
                return Page();
            }
            var info = ((int uid, string token))nullableInfo;
            Response.Cookies.Append(Constants.COOKIE_TOKEN_FIELD, info.token);
            Response.Cookies.Append(Constants.COOKIE_ID_FIELD, Convert.ToString(info.uid));

            return RedirectToPage("/Dashboard");
        }
    }
}
