using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ProjectMaVe.APIs.Google_AI;
using ProjectMaVe.Interfaces;

namespace ProjectMaVe.Pages
{
	public class AITestModel : PageModel
	{
		[BindProperty]
		required public string Prompt { get; set; }

		required public string Message { get; set; }

		private readonly IAIService _aiService;
		public AITestModel(IAIService aiService)
		{
			_aiService = aiService;
		}

		public async Task OnPostAsync()
		{
			Message = await _aiService.CallAIAsync(Prompt);
		}
	}
}

