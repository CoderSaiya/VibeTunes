using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.UseCases.Authentication.Commands;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Authentication.Events;

public class VerifyCodeHandler(
    IUserRepository userRepository,
    IUnitOfWork unitOfWork
    ) : IRequestHandler<VerifyCodeCommand, Task>
{
    public async Task<Task> Handle(VerifyCodeCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await userRepository.GetByEmailAsync(request.Email);
        if (existingUser is null)
            throw new BusinessException("User does not exist");
        
        if(!existingUser.IsActive)
            throw new BusinessException("User is not active");
        
        if(existingUser.ActiveCode != request.Code)
            throw new BusinessException("Code does not match");
        
        existingUser.ActiveCode = "";
        await unitOfWork.CommitAsync();
        
        return Task.CompletedTask;
    }
}