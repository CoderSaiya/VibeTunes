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
    public async Task SendNotification(Guid senderId, Guid recipientId, string message)
    {
        var senderUser = await userRepository.GetByIdAsync(senderId);
        if (senderUser is null || recipientId == Guid.Empty) return;

        var notification = new Notification
        {
            SenderId = senderUser.Id,
            ReceiverId = recipientId,
            Message = message,
            CreatedDate = DateTime.UtcNow
        };

        await notificationRepository.CreateNotificationAsync(notification);

        // Send Notify by SignalR
        await hubContext.Clients.User(recipientId.ToString()).SendAsync("ReceiveNotification", new
        {
            id = notification.Id,
            message = notification.Message,
            createdAt = notification.CreatedDate,
            sender = senderId,
            isRead = notification.IsRead
        });
    }
}