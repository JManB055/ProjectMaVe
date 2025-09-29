using ProjectMaVe.Models;

namespace ProjectMaVe.Interfaces;

public interface IAuthenticationService
{
    public User GetCurrentUser();
}
