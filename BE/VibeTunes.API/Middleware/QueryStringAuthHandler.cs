using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace BE.Middleware;

public class QueryStringAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public QueryStringAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options, 
        ILoggerFactory logger, 
        UrlEncoder encoder, 
        ISystemClock clock
        ) : base(options, logger, encoder, clock) { }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Query.TryGetValue("userId", out var uid) || !Guid.TryParse(uid, out var guid))
            return Task.FromResult(AuthenticateResult.Fail("Missing or invalid userId"));

        var claims = new[] {
            new Claim(ClaimTypes.NameIdentifier, guid.ToString())
        };
        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}