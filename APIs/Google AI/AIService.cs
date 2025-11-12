using ProjectMaVe.Interfaces;
using System.Net;
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
			
			//catch failed responses from the API
			HttpResponseMessage response;
			try{
				//receive response as string
				response = await client.PostAsync(url, new StringContent(json, Encoding.UTF8, "application/json"));
			}
			catch(HttpRequestException e){
				return $"Network error, try again";
			}
			
			var result =  await response.Content.ReadAsStringAsync();
			//catch 503 Service Unavailable errors
			if(response.StatusCode == HttpStatusCode.ServiceUnavailable){
				return "Service is currently unavailable, try again later. Error 503";
			}
			else if(!response.IsSuccessStatusCode){
				return "API error: {response.StatusCode} - {response.ReasonPhrase}";
			}

			try{
				//parse JSON string to get human readable output
				using var doc = JsonDocument.Parse(result);
				
				if(doc.RootElement.TryGetProperty("candidates", out var candidates)){
					var text = doc.RootElement
						.GetProperty("candidates")[0]
						.GetProperty("content")
						.GetProperty("parts")[0]
						.GetProperty("text")
						.GetString();
					return text ?? "";
				}
				else if(doc.RootElement.TryGetProperty("error", out var error)){
					var message = error.TryGetProperty("message", out var msg) ? msg.GetString() : "Unknown error";
					return $"API responded with error: {message}";
				}
				else{
					return "Unexpected response format";
				}
			}
			catch(JsonException e){
				return $"Failed to parse response, try again";
			}
		}
	}
}
