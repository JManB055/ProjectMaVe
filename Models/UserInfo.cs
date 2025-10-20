using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectMaVe.Models;

/**
 * <summary>
 *   Represents a user of MaVe
 * </summary>
 * <remarks>
 *   In other API, especially when interact with DB, a user is often identified by their id
 * </remarks>
 */
public class UserInfo
{
    private UserInfo() { }

    public UserInfo(Int32 guid, byte[] hash, byte[] salt, string fname, string lname, string email)
    {
        UserID = guid;
        PassHash = hash;
        PassSalt = salt;
        FirstName = fname;
        LastName = lname;
        Email = email;
    }

    [Key]
    [Column("user_id")]
    public Int32 UserID { get; set; } = 0;

    [Column("password_hash")]
    public byte[] PassHash { get; set; } = new byte[32];

    [Column("password_salt")]
    public byte[] PassSalt { get; set; } = new byte[32];

    [Column("first_name")]
    public string FirstName { get; set; } = "";

    [Column("last_name")]
    public string? LastName { get; set; }

    [Column("email")]
    public string Email { get; set; } = "";

}
