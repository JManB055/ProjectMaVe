namespace ProjectMaVe.Models;


public class User
{
    public User()
    {
    }

    public Guid UserID { get; set; }

    public string PassHash { get; set; }

    public string PassSalt { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string? Email { get; set; }

}
