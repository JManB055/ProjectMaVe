using ProjectMaVe.Interfaces;

namespace ProjectMaVe.Services;

public class AuthenticationService : IAuthenticationService
{
    public string GetUserName(int id)
    {
        return "Admin";
    }
}
