using ProjectMaVe.Interfaces;
using ProjectMaVe.Models;
using System.Security.Cryptography;
using System.Text;

namespace ProjectMaVe.Services;

using Token = string;
public class AuthenticationService : IAuthenticationService
{
    private readonly IDictionary<Int32, Token> _userTokenTable;
    private readonly IUserStore _userStore;

    public AuthenticationService(IUserStore userStore)
    {
        _userTokenTable = new Dictionary<Int32, Token>();
        _userStore = userStore;
    }

    private static readonly char[] _tokenChars =
        Enumerable.Range('0', 10).Select(i => (char)i)
        .Concat(Enumerable.Range('A', 26).Select(i => (char)i))
        .Concat(Enumerable.Range('a', 26).Select(i => (char)i))
        .ToArray();

    Token GenerateRandomToken()
    {
        const int TOKEN_LENGTH = 32;
        return RandomNumberGenerator.GetString(_tokenChars, TOKEN_LENGTH);
    }

    public Token GetAuthToken(Int32 uid)
    {
        if (_userTokenTable.ContainsKey(uid)) return _userTokenTable[uid];
        Token token = GenerateRandomToken();
        _userTokenTable.Add(uid, token);
        return token;
    }

    public UserInfo GetCurrentUser()
    {
        //placeholder parameters
        UserInfo currentUser = new UserInfo(0, Encoding.ASCII.GetBytes("hash"), Encoding.ASCII.GetBytes("salt"), "firstname", "lastname", "email");

        return currentUser;
    }

    public bool IsSignedIn(Int32 uid, Token token)
    {
        return _userTokenTable.ContainsKey(uid) && (_userTokenTable[uid] == token);
    }

    public async Task<(Int32, Token)?> SignInAsync(string email, string password)
    {
        UserInfo? user = _userStore.GetUserByEmail(email);

        if (user == null) return null;

        HMACSHA512 hashFn = new HMACSHA512(user.PassSalt);
        byte[] passHash = hashFn.ComputeHash(Encoding.ASCII.GetBytes(password));

        if (!passHash.SequenceEqual(user.PassHash)) return null;

        return (user.UserID, GetAuthToken(user.UserID));
    }

    public (Int32, Token)? SignIn(string email, string password)
    {
        var task = SignInAsync(email, password);
        task.Wait(1000);
        return task.IsCompletedSuccessfully ? task.Result : null;
    }

    /**
     * <remarks>
     *   For registration, UserID is unknown
     * </remarks>
     */
    public async Task<bool> RegisterAsync(UserInfo userInfo)
    {
        UserInfo? user = _userStore.GetUserByEmail(userInfo.Email);
        if (user != null) return false;

        return await _userStore.CreateUserAsync(userInfo);
    }

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
