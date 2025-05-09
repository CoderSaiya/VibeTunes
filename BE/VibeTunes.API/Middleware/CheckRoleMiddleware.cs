using BE.Security;
using VibeTunes.Infrastructure.Identity;

namespace BE.Middleware;

public class CheckRoleMiddleware(RequestDelegate next, TimeProvider timeProvider)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path;

        if (Endpoints.Public.Any(e => path.StartsWithSegments(e)))
        {
            await next(context);
            return;
        }

        if (context.User.Identity is not { IsAuthenticated: true })
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("You are not authenticated.");
            return;
        }

        using (var scope = context.RequestServices.CreateScope())
        {
            var expClaim = context.User.FindFirst("exp");
            if (expClaim is not null && long.TryParse(expClaim.Value, out var expSeconds))
            {
                var tokenExpiryDate = DateTimeOffset.FromUnixTimeSeconds(expSeconds).UtcDateTime;
                if (tokenExpiryDate < DateTimeOffset.UtcNow)
                {
                    var authService = scope.ServiceProvider.GetService<AuthService>()!;
                    var refreshToken = context.Request.Headers["X-Refresh-Token"].ToString();

                    if (string.IsNullOrEmpty(refreshToken))
                    {
                        context.Response.StatusCode = 401;
                        await context.Response.WriteAsync("Unauthorized - Refresh token required");
                        return;
                    }
                    
                    var newToken = await authService.RefreshTokenAsync(refreshToken);

                    if (newToken is null)
                    {
                        context.Response.StatusCode = 401;
                        await context.Response.WriteAsync("Unauthorized - Refresh token isn't valid");
                        return;
                    }
                    
                    context.Response.Headers["X-New-Access-Token"] = newToken;
                }
            }
            
            bool isUserEndpoint = Endpoints.User.Any(e => path.StartsWithSegments(e));
            bool isArtistEndpoint = Endpoints.Artist.Any(e => path.StartsWithSegments(e));
            bool isAdminEndpoint = Endpoints.Admin.Any(e => path.StartsWithSegments(e));

            bool hasAccess = (isUserEndpoint && context.User.IsInRole("User")) || 
                             (isArtistEndpoint && context.User.IsInRole("Artist")) ||
                             (isAdminEndpoint && context.User.IsInRole("Admin"));

            if (!hasAccess)
            {
                context.Response.StatusCode = 403;
                await context.Response.WriteAsync("Forbidden - Insufficient role permissions");
                return;
            }
        }
        
        await next(context);
    }
}