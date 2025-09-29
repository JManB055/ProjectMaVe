using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;

namespace ProjectMaVe.Services;

public class AuthenticationService : IAuthenticationService
{
    public User GetCurrentUser()
    {
        throw new NotImplementedException();
    }

    public string GetUserName(int id)
    {
        return "Admin";
    }
}
