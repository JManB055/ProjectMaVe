using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;
using ProjectMaVe.Data;
using Microsoft.EntityFrameworkCore;

namespace ProjectMaVe.Services;

public class UserStore : IUserStore
{
    private readonly DBContext _db;

    public userStore(DBContext dbContext)
    {
        _db = dbContext;
    }

    public async Task<bool> CreateUserAsync(UserInfo userInfo)
    {
        await _db.Users.AddAsync(userInfo);                 // Tells EF to stage this user for insertion
        return await _db.SaveChangesAsync() > 0;    
        // SaveChangesAsync() commits the staged changes and returns the number of affected rows
        // This function returns true if the number of affected rows is more than 0 (which means that it succeeded)
    }

    public async Task<bool> DeleteUserAsync(int uid, UserInfo userInfo)
    {
        var user = await _db.Users.FindAsync(uid);          // Lookup user in db
        if(user ==null) return false;                       // If not found, return false

        _db.Users.Remove(user);                             // If it is found, remove it
        return await _db.SaveChangesAsync() > 0;            // Same save changes as the previous function
    }

    public async Task<UserInfo?> GetUserAsync(int uid)
    {
        return await _db.Users.FindAsync(uid);              // Return the user with that uid
    }

    public async UserInfo? GetUserByEmail(string email)
    {
        return await _db.Users.FirstOrDefault(u => u.email == email);
    }

    public async Task<bool> UpdateUserAsync(int uid, UserInfo userInfo)
    {
        var existingUser = await _db.Users.FindAsync(uid);  // Lookup user in db
        if(existingUser == null) return false;              // If not found, return false

        existingUser.FirstName = userInfo.FirstName;
        existingUser.Email = userInfo.Email;
        // Copy other properties if needed

        _db.Users.Update(existingUser);                     // Stage changes
        return await _db.SaveChangesAsync() > 0;            // Same save changes as the first function
    }
}

