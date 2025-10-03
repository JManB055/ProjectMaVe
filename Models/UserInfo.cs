namespace ProjectMaVe.Models;

/**
 * <summary>
 *   Represents a user of MaVe
 * </summary>
 * <remarks>
 *   In other API, especially when interact with DB, a user is often identified by their id
 * </remarks>
 */
public sealed class UserInfo
{
    public UserInfo(Int32 guid, byte[] hash, byte[] salt, string fname, string lname, string email)
    {
        UserID = guid;
        PassHash = hash;
        PassSalt = salt;
        FirstName = fname;
        LastName = lname;
        Email = email;
    }

    public Int32 UserID { get; set; }

    public byte[] PassHash { get; set; }

    public byte[] PassSalt { get; set; }

    public string FirstName { get; set; }

    public string? LastName { get; set; }

    public string Email { get; set; }

}
