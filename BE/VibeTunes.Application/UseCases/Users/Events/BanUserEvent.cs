using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Users.Commands;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Users.Events;

public class BanUserEvent(
    IUserRepository userRepository,
    INotificationService notificationService,
    IUnitOfWork unitOfWork
    ) : IRequestHandler<BanUserCommand, Guid>
{
    public async Task<Guid> Handle(BanUserCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await userRepository.GetByIdAsync(request.UserId);
        if (existingUser is null)
            throw new BusinessException("User does not exist");
        
        existingUser.IsBanned = true;
        
        await unitOfWork.CommitAsync();
        
        await notificationService.SendNotification(Guid.Parse("c7b70dd9-29c7-45ce-91de-220c9795758a"), existingUser.Id, "Your account has been banned.");
        
        return existingUser.Id;
    }
}