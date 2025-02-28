using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Authentication.Commands;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Authentication.Events;

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
        
        await notificationService.SendNotification("System", existingUser.Id.ToString(), "Your account has been banned.");
        
        return existingUser.Id;
    }
}