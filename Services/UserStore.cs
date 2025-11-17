using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;
using ProjectMaVe.Data;

namespace ProjectMaVe.Services;

public class UserStore : IUserStore
{
    private readonly DBContext _db;

    public UserStore(DBContext dbContext)
    {
        _db = dbContext;
    }

	/// <summary>
	/// Create new user entry in database
	/// </summary>
	/// <param name="userInfo">User info object</param>
	/// <returns>
	/// Boolean indicating success or failure
	/// </returns>
	/// <remarks>
	/// This function uses database context to add a new user to the database
	/// </remarks>
    public async Task<bool> CreateUserAsync(UserInfo userInfo)
    {
        await _db.Users.AddAsync(userInfo);                 // Tells EF to stage this user for insertion
        return await _db.SaveChangesAsync() > 0;    
        // SaveChangesAsync() commits the staged changes and returns the number of affected rows
        // This function returns true if the number of affected rows is more than 0 (which means that it succeeded)
    }

	/// <summary>
	/// Delete user entry in database
	/// </summary>
	/// <param name="uid">User UID</param>
	/// <param name="userInfo">User info object</param>
	/// <returns>
	/// Boolean indicating success or failure
	/// </returns>
	/// <remarks>
	/// This function uses database context to find a user based on the UID, then deletes that user
	/// </remarks>
    public async Task<bool> DeleteUserAsync(int uid, UserInfo userInfo)
    {
        var user = await _db.Users.FindAsync(uid);          // Lookup user in db
        if(user ==null) return false;                       // If not found, return false

        _db.Users.Remove(user);                             // If it is found, remove it
        return await _db.SaveChangesAsync() > 0;            // Same save changes as the previous function
    }

	/// <summary>
	/// Find user entry in database via UID
	/// </summary>
	/// <param name="uid">User UID</param>
	/// <returns>
	/// User info object
	/// </returns>
	/// <remarks>
	/// This function uses database context to find a user based on their UID
	/// </remarks>
    public async Task<UserInfo?> GetUserAsync(int uid)
    {
        return await _db.Users.FindAsync(uid);              // Return the user with that uid
    }

	/// <summary>
	/// Find user entry in database via email
	/// </summary>
	/// <param name="email">User email</param>
	/// <returns>
	/// User info object
	/// </returns>
	/// <remarks>
	/// This function uses database context to find a user based on their email
	/// </remarks>
    public UserInfo? GetUserByEmail(string email)
    {
        return _db.Users.FirstOrDefault(u => u.Email == email);
    }

	/// <summary>
	/// Update user entry in database
	/// </summary>
	/// <param name="uid">User UID</param>
	/// <param name="userInfo">User info object</param>
	/// <returns>
	/// Boolean indicating success or failure
	/// </returns>
	/// <remarks>
	/// This function uses database context to find a user based on the UID, and updates the first name, last name and email provided in the user info object
	/// </remarks>
    public async Task<bool> UpdateUserAsync(int uid, UserInfo userInfo)
    {
        var existingUser = await _db.Users.FindAsync(uid);  // Lookup user in db
        if(existingUser == null) return false;              // If not found, return false

        existingUser.FirstName = userInfo.FirstName;
        existingUser.LastName = userInfo.LastName;
        existingUser.Email = userInfo.Email;

        _db.Users.Update(existingUser);                     // Stage changes
        return await _db.SaveChangesAsync() > 0;            // Same save changes as the first function
    }
}

