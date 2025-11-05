using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ProjectMaVe.Pages
{
    public class AITestModel : PageModel
    {
        [BindProperty]
        public string Prompt { get; set; }

        public string Message { get; set; }

        public void OnPost()
        {
            Message = $"Received input: {Prompt}";
        }
    }
}

