namespace VibeTunes.Application.Interfaces;

public interface INotificationService
{
    public Task SendNotification(Guid senderId, Guid recipientId, string message);
}