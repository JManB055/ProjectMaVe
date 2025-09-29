using ProjectMaVe.Models;

namespace ProjectMaVe.Interfaces;

public interface IAuthenticationService
{
    public string GetUserName(int id);

    public User GetCurrentUser();
}
