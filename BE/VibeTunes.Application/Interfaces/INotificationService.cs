namespace VibeTunes.Application.Interfaces;

public interface INotificationService
{
    public Task SendNotification(string sender, string recipientId, string message);
}