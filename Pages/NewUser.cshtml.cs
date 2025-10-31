using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;
using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;
using System.Security.Cryptography;
using System.Text.RegularExpressions;

namespace ProjectMaVe.Pages
{
    public class NewUserModel : PageModel
    {
        /*
        UserID = guid;
        PassHash = hash;
        PassSalt = salt;
        FirstName = fname;
        LastName = lname;
        Email = email;
         */
        [BindProperty]
        [Required(ErrorMessage = "Please enter your username.")]
        public string UserName { get; set; }

        [BindProperty]
        [Required(ErrorMessage = "Please enter your password.")]
        public string Password { get; set; }

        [BindProperty]
        [Required(ErrorMessage = "Please enter your First Name.")]
        public string FirstName { get; set; }

        [BindProperty]
        [Required(ErrorMessage = "Please enter your Last Name.")]
        public string LastName { get; set; }

        [BindProperty]
        [Required(ErrorMessage = "Please enter your Email.")]
        public string Email { get; set; }


        public string Message { get; set; }

        public void OnGet()
        {
        }

        public async Task<IActionResult> OnPostNewUser()
        {
            if (UserName == null)
            {
                Message = "Please enter your username.";
                ModelState.AddModelError(String.Empty, "Invalid newuser attempt.");
                return Page();
            }
            if (Password == null)
            {
                Message = "Please enter your password.";
                ModelState.AddModelError(String.Empty, "Invalid newuser attempt.");
                return Page();
            }
            if (FirstName == null)
            {
                Message = "Please enter your First Name.";
                ModelState.AddModelError(String.Empty, "Invalid newuser attempt.");
                return Page();
            }
            if (LastName == null)
            {
                Message = "Please enter your Last Name.";
                ModelState.AddModelError(String.Empty, "Invalid newuser attempt.");
                return Page();
            }
            if (Email == null)
            {
                Message = "Please enter your Email.";
                ModelState.AddModelError(String.Empty, "Invalid newuser attempt.");
                return Page();
            }

            string emailPattern = @"\w+@\w+\.\w+"; //text@text.text
            if (!(Regex.IsMatch(Email, emailPattern)))
            {
                Message = "E-mail is invalid.";
                return Page();
            }

            var loginService = HttpContext.RequestServices.GetService<IAuthenticationService>();

            CreatePasswordHash(Password, out byte[] passwordHash, out byte[] passwordSalt);

            UserInfo user = new UserInfo(0, passwordHash, passwordSalt, FirstName, LastName, Email);
            bool success = await loginService.RegisterAsync(user);
            if (success == false)
            {
                Message = "Login Failed.";
                ModelState.AddModelError(String.Empty, "Invalid login attempt.");
                return Page();
            }

            await loginService.SetPassword(user.UserID, Password);

            return RedirectToPage("/LogIn");
        }

        public void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            passwordSalt = new byte[64];
            RandomNumberGenerator.Fill(passwordSalt);

            using (var hmac = new HMACSHA512(passwordSalt))
            {
                passwordHash = hmac.ComputeHash(System.Text.Encoding.ASCII.GetBytes(password));
            }
        }
    }
}
