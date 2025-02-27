using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Authentication.Commands;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Authentication.Events;

public class ChangePasswordHandler(
    IAuthService authService,
    IUserRepository userRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<ChangePasswordCommand, string>
{
    public async Task<string> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        //check user exist
        var existingUser = await userRepository.GetByIdAsync(request.UserId);
        if (existingUser == null)
            throw new BusinessException("User does not exist");
        
        // check old pass
        if (!authService.VerifyPassword(request.OldPassword, existingUser.Password))
            throw new BusinessException("Invalid password.");
        
        // change pass
        var newPass = authService.HashPassword(request.NewPassword);
        existingUser.Password = newPass;
        
        await unitOfWork.CommitAsync();
        
        return newPass;
    }
}