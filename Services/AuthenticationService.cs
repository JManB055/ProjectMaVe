using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;

namespace ProjectMaVe.Services;

public class AuthenticationService : IAuthenticationService
{
	/*
	GetCurrentUser will return an object of the User class,
	which is defined in ~/Models/User.cs
	
	The user has the following parameters to define them:
	Guid UserID - the user ID
	string PassHash - the hash of the password
	string PassSalt - salting the hash
	string FirstName - user first name (nullable)
	string LastName - user last name (nullable)
	string Email - user email (nullable)
	*/
    public User GetCurrentUser()
    {
		//placeholder parameters
		User currentUser = new User(Guid.NewGuid(), "hash", "salt", "firstname", "lastname", "email");
		
        return currentUser;
    }
}
