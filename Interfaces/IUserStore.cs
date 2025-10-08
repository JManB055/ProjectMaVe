using ProjectMaVe.Data;
using ProjectMaVe.Models;

namespace ProjectMaVe.Interfaces;

public interface IUserStore
{
    Task<bool> CreateUserAsync(UserInfo userInfo);

    Task<bool> DeleteUserAsync(int uid, UserInfo userInfo);
    Task<UserInfo?> GetUserAsync(int uid);

    UserInfo? GetUserByEmail(string email);

    Task<bool> UpdateUserAsync(int uid, UserInfo userInfo);
}
