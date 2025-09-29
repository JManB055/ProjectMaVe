using ProjectMaVe.Data;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Security.Cryptography;

namespace ProjectMaVe.Pages
{

    public class LoginModel : PageModel
    {
        [BindProperty]
        [Required(ErrorMessage = "Please enter your username.")]
        public string UserName { get; set; }

        [BindProperty]
        [Required(ErrorMessage = "Please enter your password.")]
        public string Password { get; set; }

        public string Message { get; set; }

        public void OnGet()
        {
        }
        
        public async Task<IActionResult> OnPostLogIn()
        {
            if (UserName == null)
            {
                Message = "The User Name field is empty.";
                ModelState.AddModelError(String.Empty, "Invalid login attemt.");
                return Page();
            }
            if (Password == null)
            {
                Message = "The Password field is empty.";
                ModelState.AddModelError(String.Empty, "Invalid login attemt.");
                return Page();
            }

            //Create a claim to identify the user
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, UserName),
                //new Claim("UserID", user.UserID.ToString()) //this is a custom claim
            };

            //Create our authenticated cookie for our logged in user
            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties
            {
                IsPersistent = true, //This keeps user logged in after browser closes
                ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(1), //For testing purposes
            };

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity));
            return RedirectToPage("/Index");
        }
    }
}
