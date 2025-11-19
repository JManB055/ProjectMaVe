using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;
using System.Security.Cryptography;
using System.Collections.Concurrent;
using System.Text;

namespace ProjectMaVe.Services;

using Token = string;
public class AuthenticationService : IAuthenticationService
{
    // static is a hack, what really should happen is a scope factory for db
    private static readonly ConcurrentDictionary<Int32, Token> _userTokenTable = new();
    private readonly IUserStore _userStore;
    private readonly IHttpContextAccessor _accessor;
    private readonly ILogger<AuthenticationService> _logger;

    public AuthenticationService(IUserStore userStore, IHttpContextAccessor accessor, ILogger<AuthenticationService> logger)
    {
        _userStore = userStore;
        _accessor = accessor;
        _logger = logger;
    }

    private static readonly char[] _tokenChars =
        Enumerable.Range('0', 10).Select(i => (char)i)
        .Concat(Enumerable.Range('A', 26).Select(i => (char)i))
        .Concat(Enumerable.Range('a', 26).Select(i => (char)i))
        .ToArray();

	/// <summary>
	/// Generate random authentication token
	/// </summary>
	/// <returns>
	/// Token used for sign in
	/// </returns>
	/// <remarks>
	/// This function generates a random token
	/// </remarks>
    Token GenerateRandomToken()
    {
        const int TOKEN_LENGTH = 32;
        return RandomNumberGenerator.GetString(_tokenChars, TOKEN_LENGTH);
    }

	/// <summary>
	/// Get authentication token for user 
	/// </summary>
	/// <param name="uid">User UID</param>
	/// <returns>
	/// Token used for sign in
	/// </returns>
	/// <remarks>
	/// This function provides a random token for a specific user
	/// </remarks>
    public Token GetAuthToken(Int32 uid)
    {
        if (_userTokenTable.ContainsKey(uid)) return _userTokenTable[uid];
        Token token = GenerateRandomToken();
        _userTokenTable[uid] = token;
        return token;
    }

	/// <summary>
	/// Get cookie info
	/// </summary>
	/// <returns>
	/// User UID and authentication token needed for sign in
	/// </returns>
	/// <remarks>
	/// This function accesses cookie data to find the current user's UID and token
	/// </remarks>
    public (Int32 uid, Token token)? GetCookieInfo()
    {

		var cookies = _accessor.HttpContext?.Request.Cookies;
		if (cookies is null)
		{
		    _logger.LogWarning("No HttpContext or Cookies available.");
		    return null;
		}
		
		if (!cookies.TryGetValue(Constants.COOKIE_ID_FIELD, out string uidString))
		{
		    _logger.LogWarning("Missing UID cookie.");
		    return null;
		}
		
		if (!cookies.TryGetValue(Constants.COOKIE_TOKEN_FIELD, out string token))
		{
		    _logger.LogWarning("Missing token cookie.");
		    return null;
		}
		
		if (!int.TryParse(uidString, out int uid))
		{
		    _logger.LogWarning($"Invalid UID cookie value: {uidString}");
		    return null;
		}
		
		if (!IsSignedIn(uid, token))
		{
		    _logger.LogWarning($"IsSignedIn failed for UID {uid}");
		    return null;
		}
		
		_logger.LogInformation($"Successfully retrieved cookie info for UID {uid}");
		return (uid, token);
		
	}

	/// <summary>
	/// Access current user info
	/// </summary>
	/// <returns>
	/// User Info object for current user
	/// </returns>
	/// <remarks>
	/// This function returns info for the current user signed in via cookies
	/// </remarks>
    public async Task<UserInfo?> GetCurrentUser()
    {
        var info = GetCookieInfo();
        if (info is null) return null;
        return await _userStore.GetUserAsync(info.Value.uid);
    }

	/// <summary>
	/// Check if any user is signed in
	/// </summary>
	/// <returns>
	/// Boolean indicating success or failure
	/// </returns>
	/// <remarks>
	/// This function checks whether any user is signed in by checking for cookie info
	/// </remarks>
    public bool IsCurrentSignedIn()
    {
        return !(GetCookieInfo() is null);
    }

	/// <summary>
	/// Check if a specific user is signed in
	/// </summary>
	/// <param name="uid">User UID</param>
	/// <param name="token">Authentication token</param>
	/// <returns>
	/// Boolean indicating success or failure
	/// </returns>
	/// <remarks>
	/// This function checks whether a given user is signed in based on the UID
	/// </remarks>
    public bool IsSignedIn(Int32 uid, Token token)
    {
        return _userTokenTable.ContainsKey(uid) && (_userTokenTable[uid] == token);
    }

	/// <summary>
	/// Sign in to account
	/// </summary>
	/// <param name="email">User email</param>
	/// <param name="password">Plaintext password</param>
	/// <returns>
	/// User UID and authentication token needed for sign in
	/// </returns>
	/// <remarks>
	/// This function uses the user email to find the user, then hashes the given password
	/// and compares it with the user password using the salt. If there is a match, a token is generated
	/// </remarks>
    public async Task<(Int32, Token)?> SignInAsync(string email, string password)
    {
        UserInfo? user = _userStore.GetUserByEmail(email);

        if (user == null) return null;

        HMACSHA512 hashFn = new HMACSHA512(user.PassSalt);
        byte[] passHash = hashFn.ComputeHash(Encoding.ASCII.GetBytes(password));

        if (!passHash.SequenceEqual(user.PassHash)) return null;

        return (user.UserID, GetAuthToken(user.UserID));
    }

	/// <summary>
	/// Sign in to account
	/// </summary>
	/// <param name="email">User email</param>
	/// <param name="password">Plaintext password</param>
	/// <returns>
	/// Boolean indicating success or failure
	/// </returns>
	/// <remarks>
	/// This function uses SignInAsync and allows 1000 milliseconds before returning success or failure
	/// </remarks>
    public (Int32, Token)? SignIn(string email, string password)
    {
        var task = SignInAsync(email, password);
        task.Wait(1000);
        return task.IsCompletedSuccessfully ? task.Result : null;
    }

	/// <summary>
	/// Register new user
	/// </summary>
	/// <param name="userInfo">User Info object</param>
	/// <returns>
	/// Boolean indicating success or failure
	/// </returns>
	/// <remarks>
	/// This function checks if a user already exists by searching for the email, and creates a new user if the email isn't found
	/// </remarks>
    public async Task<bool> RegisterAsync(UserInfo userInfo)
    {
        UserInfo? user = _userStore.GetUserByEmail(userInfo.Email);
        if (user != null) return false;

        return await _userStore.CreateUserAsync(userInfo);
    }

	/// <summary>
	/// Allow user to set a new password
	/// </summary>
	/// <param name="uid">User UID</param>
	/// <param name="password">Plaintext password</param>
	/// <returns>
	/// Boolean indicating success or failure
	/// </returns>
	/// <remarks>
	/// This function securely stores passwords based on the UID using salting and hashing
	/// </remarks>
    public async Task<bool> SetPassword(Int32 uid, string password)
    {
        byte[] passSalt = new byte[64];
        RandomNumberGenerator.Fill(passSalt);

        UserInfo? user = await _userStore.GetUserAsync(uid);
        if (user == null) return false;


        HMACSHA512 hashFn = new HMACSHA512(passSalt);
        byte[] passHash = hashFn.ComputeHash(Encoding.ASCII.GetBytes(password));


        user.PassSalt = passSalt;
        user.PassHash = passHash;

        return await _userStore.UpdateUserAsync(uid, user);
    }
}
