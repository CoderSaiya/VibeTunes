using VibeTunes.Domain.Entities;

namespace VibeTunes.Domain.Interfaces;

public interface INotificationRepository
{
    public Task<IEnumerable<Notification>> GetAllNotificationsAsync();
    public Task<Notification?> GetNotificationByIdAsync(Guid notificationId);
    public Task<IEnumerable<Notification>> GetNotificationByReceiverIdAsync(Guid receiverId);
    public Task<IEnumerable<Notification>> GetNotificationBySenderIdAsync(Guid senderId);
    public Task<IEnumerable<Notification>> GetAllReadNotificationByUserIdAsync(Guid userId);
    public Task<IEnumerable<Notification>> GetAllNewNotificationByUserIdAsync(Guid userId);
    public Task<bool> CreateNotificationAsync(Notification notification);
    public Task<bool> UpdateNotificationAsync(Notification notification);
    public Task<bool> UpdateReadStatusAsync(bool isRead, Guid notificationId);
    public Task<bool> UpdateReadStatusAsync(bool isRead, params Guid[] notificationIds);
    public Task<bool> DeleteAllReadNotificationByUserIdAsync(Guid userId);
}