using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.UseCases.Users.Commands;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Users.Events;

public class CheckValidUserHandler(
    IUserRepository userRepository
    ) : IRequestHandler<CheckValidUserCommand, Unit>
{
    public async Task<Unit> Handle(CheckValidUserCommand request, CancellationToken cancellationToken)
    {
        // check user exists
        var user = await userRepository.GetByIdAsync(request.UserId);
        if (user == null)
            throw new BusinessException("User with this email not exists.");
        
        // check gmail active
        if (!string.IsNullOrEmpty(user.ActiveCode))
            throw new BusinessException("User not active.");
        
        // check banned
        if (user.IsBanned)
            throw new BusinessException("User is banned");

        return Unit.Value;
    }
}