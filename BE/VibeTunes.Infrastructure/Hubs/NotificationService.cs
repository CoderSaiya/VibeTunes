using Microsoft.AspNetCore.SignalR;
using VibeTunes.Application.Interfaces;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Infrastructure.Hubs;

public class NotificationService(
    IHubContext<NotificationHub> hubContext,
    IUserRepository userRepository,
    INotificationRepository notificationRepository
) : INotificationService
{
    public async Task SendNotification(string sender, string recipientId, string message)
    {
        var senderUser = await userRepository.GetByUsernameAsync(sender);
        if (senderUser is null || string.IsNullOrEmpty(recipientId)) return;

        var notification = new Notification
        {
            SenderId = senderUser.Id,
            ReceiverId = Guid.Parse(recipientId),
            Message = message,
            CreatedDate = DateTime.UtcNow
        };

        await notificationRepository.CreateNotificationAsync(notification);

        // Send Notify by SignalR
        await hubContext.Clients.User(recipientId).SendAsync("ReceiveNotification", new
        {
            id = notification.Id,
            message = notification.Message,
            createdAt = notification.CreatedDate,
            sender = sender,
            isRead = notification.IsRead
        });
    }
}