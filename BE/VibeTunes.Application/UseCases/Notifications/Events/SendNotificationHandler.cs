using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Notifications.Commands;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Notifications.Events;

public class SendNotificationHandler(
    IUserRepository userRepository,
    INotificationService notificationService
    ) : IRequestHandler<SendNotificationCommand, Unit>
{
    public async Task<Unit> Handle(SendNotificationCommand request, CancellationToken cancellationToken)
    {
        // check sender and receiver exist
        var existingSender = await userRepository.GetByIdAsync(request.SenderId);
        var existingReceiver = await userRepository.GetByIdAsync(request.ReceiverId);
        if (existingSender is null || existingReceiver is null)
            throw new BusinessException("Sender or Receiver does not exist");
        
        // format message
        string formattedMessage = request.Message
            .Replace("\r\n", Environment.NewLine)
            .Replace("\n", Environment.NewLine);
        
        // send notification
        await notificationService.SendNotification(existingSender.Id, existingReceiver.Id, formattedMessage);
        
        return Unit.Value;
    }
}