using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;

namespace ProjectMaVe.Services;

public class UserStore : IUserStore
{
    public Task<bool> CreateUserAsync(UserInfo userInfo)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteUserAsync(int uid, UserInfo userInfo)
    {
        throw new NotImplementedException();
    }


    public Task<UserInfo?> GetUserAsync(int uid)
    {
        throw new NotImplementedException();
    }

    public UserInfo? GetUserByEmail(string email)
    {
        throw new NotImplementedException();
    }

    public Task<bool> UpdateUserAsync(int uid, UserInfo userInfo)
    {
        throw new NotImplementedException();
    }
}
