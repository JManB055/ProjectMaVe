
using Microsoft.AspNetCore.Identity;
using System.Globalization;

namespace ProjectMaVe.Middleware
{
    public class AuthenticationMiddleware : IMiddleware
    {
        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            var userId = context.Request.Cookies["mave_user_id"];
            if (!string.IsNullOrWhiteSpace(userId))
            {
                
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
}
