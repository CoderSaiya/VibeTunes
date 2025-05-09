using Microsoft.AspNetCore.SignalR;
using VibeTunes.Application.Interfaces;

namespace VibeTunes.Infrastructure.Hubs;

public class NotificationHub : Hub
{
    private static readonly Dictionary<string, string> UserConnections = new();
    
    public override Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if (!string.IsNullOrEmpty(userId))
        {
            UserConnections[userId] = Context.ConnectionId;
        }
        return base.OnConnectedAsync();
    }
    
    public override Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        if (!string.IsNullOrEmpty(userId))
        {
            UserConnections.Remove(userId);
        }
        return base.OnDisconnectedAsync(exception);
    }
}