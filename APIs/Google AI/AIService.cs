using ProjectMaVe.Interfaces;
using System.Text;
using System.Text.Json;

namespace ProjectMaVe.APIs.Google_AI
{
	public class AIService : IAIService
	{
		//read the Google Gemini 2.5 Flash API key from .env
		private readonly string _apiKey;
		public AIService(string apiKey) => _apiKey = apiKey;

		//asynchronous method to handle AI prompt
		public async Task<string> CallAIAsync(string prompt)
		{
			using var client = new HttpClient();
			var payload = new
			{
				contents = new[]
				{
					new { parts = new[] { new { text = prompt } } }
				}
			};
			//convert payload into JSON
			var json = JsonSerializer.Serialize(payload);
			//access model with API key
			var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}";
			//receive response as string
			var response = await client.PostAsync(url, new StringContent(json, Encoding.UTF8, "application/json"));
			var result =  await response.Content.ReadAsStringAsync();

			//parse JSON string to get human readable output
			using var doc = JsonDocument.Parse(result);
			var text = doc.RootElement
				.GetProperty("candidates")[0]
				.GetProperty("content")
				.GetProperty("parts")[0]
				.GetProperty("text")
				.GetString();

			return text ?? "";
		}
	}
}
