
using Microsoft.AspNetCore.Authorization;

namespace ProjectMaVe.Middleware;

public class AuthenticationMiddleware : IMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        var userId = context.Request.Cookies[Constants.COOKIE_ID_FIELD];
        var userToken = context.Request.Cookies[Constants.COOKIE_TOKEN_FIELD];

        var authService = context.RequestServices.GetService<IAuthorizationService>();

        if (!string.IsNullOrWhiteSpace(userId))
        {
            userId = null;
        }

        await next(context);
    }
}

public static class RequestCultureMiddlewareExtensions
{
    public static IApplicationBuilder UseMaVeAuthentication(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<AuthenticationMiddleware>();
    }
}
