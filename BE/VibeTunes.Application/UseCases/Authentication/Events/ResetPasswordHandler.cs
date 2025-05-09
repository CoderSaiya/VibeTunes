using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Authentication.Commands;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Authentication.Events;

public class ResetPasswordHandler(
    IUserRepository userRepository,
    IAuthService authService,
    IUnitOfWork unitOfWork
) : IRequestHandler<ResetPasswordCommand, Task>
{
    public async Task<Task> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await userRepository.GetByEmailAsync(request.Email);
        if (existingUser is null)
            throw new BusinessException("User does not exist");
        
        if(!existingUser.IsActive)
            throw new BusinessException("User is not active");
        
        var passwordHash = authService.HashPassword(request.Password);
        existingUser.Password = passwordHash;
        await unitOfWork.CommitAsync();
        
        return Task.CompletedTask;
    }
}