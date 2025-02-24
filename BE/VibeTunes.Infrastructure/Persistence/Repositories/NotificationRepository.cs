using Microsoft.EntityFrameworkCore;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;
using VibeTunes.Infrastructure.Persistence.Data;

namespace VibeTunes.Infrastructure.Persistence.Repositories;

public class NotificationRepository(AppDbContext context) : INotificationRepository
{
    public async Task<IEnumerable<Notification>> GetAllNotificationsAsync()
    {
        return await context.Notifications.ToListAsync();
    }

    public async Task<Notification?> GetNotificationByIdAsync(Guid notificationId)
    {
        return await context.Notifications.FindAsync(notificationId);
    }

    public async Task<IEnumerable<Notification>> GetNotificationByReceiverIdAsync(Guid receiverId)
    {
        return await context.Notifications
            .Where(n => n.ReceiverId == receiverId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Notification>> GetNotificationBySenderIdAsync(Guid senderId)
    {
        return await context.Notifications
            .Where(n => n.SenderId == senderId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Notification>> GetAllReadNotificationByUserIdAsync(Guid userId)
    {
        return await context.Notifications
            .Where(n => n.IsRead == true && n.ReceiverId == userId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Notification>> GetAllNewNotificationByUserIdAsync(Guid userId)
    {
        return await context.Notifications
            .Where(n => n.IsRead == false && n.ReceiverId == userId)
            .ToListAsync();
    }

    public async Task<bool> CreateNotificationAsync(Notification notification)
    {
        try
        {
            await context.Notifications.AddAsync(notification);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> UpdateNotificationAsync(Notification notification)
    {
        var existingNotification = await context.Notifications.FindAsync(notification.Id);
        if (existingNotification == null)
            return false;
        context.Entry(existingNotification).CurrentValues.SetValues(notification);
        return true;
    }

    public async Task<bool> UpdateReadStatusAsync(bool isRead, Guid notificationId)
    {
        var existingNotification = await context.Notifications.FindAsync(notificationId);
        if (existingNotification == null)
            return false;
        existingNotification.IsRead = isRead;
        return true;
    }

    public async Task<bool> UpdateReadStatusAsync(bool isRead, params Guid[] notificationIds)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> DeleteAllReadNotificationByUserIdAsync(Guid userId)
    {
        var existingNotifications = await context.Notifications
            .Where(n => n.ReceiverId == userId && n.IsRead == true)
            .ToListAsync();
        if (!existingNotifications.Any())
            return false;
        context.Notifications.RemoveRange(existingNotifications);
        return true;
    }
}