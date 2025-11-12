using ProjectMaVe.Models;
using ProjectMaVe.Services;

namespace ProjectMaVe.Interfaces;

using Token = string;
public interface IAuthenticationService
{
    Task<UserInfo?> GetCurrentUser();
    bool IsCurrentSignedIn();

    /**
     * <summary>
     * Login via email and password
     * </summary>
     * <param name="email">User Email</param>
     * <param name="password">Plaintext Password</param>
     * <returns>login result</returns>
     */
    Task<(Int32 uid, Token token)?> SignInAsync(string email, string password);
    (Int32 uid, Token token)? SignIn(string email, string password);

    string GetAuthToken(Int32 uid);
    bool IsSignedIn(Int32 uid, Token token);
    Task<bool> SetPassword(Int32 uid, string password);
    Task<bool> RegisterAsync(UserInfo userInfo);
}
