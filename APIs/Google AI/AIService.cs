using ProjectMaVe.Interfaces;
using System.Text;
using System.Text.Json;

namespace ProjectMaVe.APIs.Google_AI
{
    public class AIService : IAIService
    {   
            private readonly string _apiKey;
            public AIService(string apiKey) => _apiKey = apiKey;

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
                var json = JsonSerializer.Serialize(payload);
                var url = $"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={_apiKey}";
                var response = await client.PostAsync(url, new StringContent(json, Encoding.UTF8, "application/json"));
                return await response.Content.ReadAsStringAsync();
            }

    }
}
