using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace ProjectMaVe.APIs.Fitbit
{
    public class FitbitAuthenticator : IFitbitAuthenticator
    {
        private readonly string clientId = "CLIENT_ID";
        private readonly string clientSecret = "CLIENT_SECRET";
        private readonly string redirectUri = "https://mave.yhrcl.org/fitbit/callback";
        
        public string GetAuthorizationUrl()
        {
            return $"https://www.fitbit.com/oauth2/authorize?response_type=code&client_id={clientId}&redirect_uri={redirectUri}&scope=activity&expires_in=604800";
        }

        public async Task<Token> GetTokenAsync(string code)
        {
            using var client = new HttpClient();
            var authHeader = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authHeader);

            var content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("client_id", clientId),
                new KeyValuePair<string, string>("grant_type", "authorization_code"),
                new KeyValuePair<string, string>("redirect_uri", redirectUri),
                new KeyValuePair<string, string>("code", code)
            });

            var response = await client.PostAsync("https://api.fitbit.com/oauth2/token", content);
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<Token>(json) ?? throw new InvalidOperationException("Failed to deserialize token."); //deserialize into token model
        }

        public async Task<Token> RefreshTokenAsync(string token)
        {
            using var client = new HttpClient();

            var authHeader = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authHeader);

            var content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("grant_type", "refresh_token"),
                new KeyValuePair<string, string>("refresh_token", token),
                new KeyValuePair<string, string>("client_id", clientId)
            });

            var response = await client.PostAsync("https://api.fitbit.com/oauth2/token", content);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<Token>(json) ?? throw new InvalidOperationException("Failed to deserialize token."); //deserialize into token model
        }
    }
}
