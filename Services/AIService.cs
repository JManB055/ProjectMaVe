using ProjectMaVe.Interfaces;
using System.Net;
using System.Text;
using System.Text.Json;

namespace ProjectMaVe.Services
{
	public class AIService : IAIService
	{
		//read the Google Gemini 2.5 Flash API key from .env
		private readonly string _apiKey;
		public AIService(string apiKey) => _apiKey = apiKey;

		/// <summary>
		/// Make call to Google Gemini API
		/// </summary>
		/// <param name="prompt">User prompt</param>
		/// <returns>
		/// String containing response from Google Gemini API
		/// </returns>
		/// <remarks>
		/// This function converts an input string to JSON, sends it to the API, handles errors and dropped packets,
		/// responds with JSON and parses the response to text for the user to read
		/// </remarks>
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
			
			//track attempted connections with API for more robust error handling
			//the Google Gemini API has certian periods of very heavy traffic leading to bursts of 503 error codes
			const int retries = 3;
			int attempt = 0;
			
			while(attempt <= retries){
				//try to receive a response from the API
				try{
					//receive response as string
					var response = await client.PostAsync(url, new StringContent(json, Encoding.UTF8, "application/json"));
					var result = await response.Content.ReadAsStringAsync();
					//handle 503 error codes with exponential backoff algorithm
					if(response.StatusCode == HttpStatusCode.ServiceUnavailable){
						attempt++;
						if(attempt > retries)
							return "Error 503: Service is currently unavailable, try again later.";
						
						//exponential backoff algorithm
						int delay = (int)(Math.Pow(2, attempt) * 500 + new Random().Next(0, 300));
						await Task.Delay(delay);
						continue;
					}
					//handle additional error codes
					if(!response.IsSuccessStatusCode){
						return "API error: {response.StatusCode} - {response.ReasonPhrase}";
					}
					//parse the response
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
					//handle different JSON formats
					else if(doc.RootElement.TryGetProperty("error", out var error)){
						var message = error.TryGetProperty("message", out var msg) ? msg.GetString() : "Unknown error";
						return $"API responded with error: {message}";
					}
					else{
						return "Unexpected response format";
					}
				}
				catch(HttpRequestException e1){
					return $"Network error, try again";
				}
				catch(JsonException e2){
					return $"Failed to parse response, try again";
				}
			}
			
			return "An unexpected error has occured, try again";
		}
	}
}
