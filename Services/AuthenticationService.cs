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

    Token GenerateRandomToken()
    {
        const int TOKEN_LENGTH = 32;
        return RandomNumberGenerator.GetString(_tokenChars, TOKEN_LENGTH);
    }

    public Token GetAuthToken(Int32 uid)
    {
        if (_userTokenTable.ContainsKey(uid)) return _userTokenTable[uid];
        Token token = GenerateRandomToken();
        _userTokenTable[uid] = token;
        return token;
    }

    public (Int32 uid, Token token)? GetCookieInfo()
    {
        var cookies = _accessor.HttpContext?.Request.Cookies;
        if (cookies is null) return null;
        if (!cookies.TryGetValue(Constants.COOKIE_ID_FIELD, out string uidString)) return null;
        if (!cookies.TryGetValue(Constants.COOKIE_TOKEN_FIELD, out string token)) return null;
        var uid = Int32.Parse(uidString);
        if (!IsSignedIn(uid, token)) return null;
        return (uid, token);
    }

    public async Task<UserInfo?> GetCurrentUser()
    {
        var info = GetCookieInfo();
        if (info is null) return null;
        return await _userStore.GetUserAsync(info.Value.uid);
    }

    public bool IsCurrentSignedIn()
    {
        return !(GetCookieInfo() is null);
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
