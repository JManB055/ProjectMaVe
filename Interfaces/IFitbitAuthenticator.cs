using ProjectMaVe.Models;

namespace ProjectMaVe.Interfaces
{
    public interface IFitbitAuthenticator
    {
        string GetAuthorizationUrl();
        Task<Token> GetTokenAsync(string code);
        Task<Token> RefreshTokenAsync(string token);

    }
}
