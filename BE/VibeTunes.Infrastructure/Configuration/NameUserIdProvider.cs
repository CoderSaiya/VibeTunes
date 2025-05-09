using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

namespace VibeTunes.Infrastructure.Configuration;

public class NameUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        // Lấy từ claim "sub" (JWT subject) hoặc ClaimTypes.NameIdentifier
        return connection.User?
            .FindFirst(ClaimTypes.NameIdentifier)?
            .Value;
    }
}