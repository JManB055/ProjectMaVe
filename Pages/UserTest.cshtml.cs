using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ProjectMaVe.Pages
{
    public class UserTestModel : PageModel
    {
        private readonly ILogger<UserTestModel> _logger;

        public UserTestModel(ILogger<UserTestModel> logger)
        {
            _logger = logger;
        }

        public void OnGet()
        {

        }
    }
}
