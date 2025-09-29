namespace ProjectMaVe.Models;


public class User
{
    //default constructor
    public User()
    {
    }

    //overloaded constructor
    public User(Guid guid, string hash, string salt, string fname, string lname, string email)
    {
        Guid = guid;
        PassHash = hash;
        PassSalt = salt;
        FirstName = fname;
        LastName = lname;
        Email = email;
    }

    public Guid UserID { get; set; }

    public string PassHash { get; set; }

    public string PassSalt { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string? Email { get; set; }

}
