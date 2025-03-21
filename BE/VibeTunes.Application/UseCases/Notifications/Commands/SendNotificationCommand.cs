using MediatR;

namespace VibeTunes.Application.UseCases.Notifications.Commands;

public record SendNotificationCommand(
    Guid SenderId,
    Guid ReceiverId,
    string Message
    ) : IRequest<Unit>;