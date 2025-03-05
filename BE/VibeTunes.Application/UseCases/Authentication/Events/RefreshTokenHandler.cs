using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Authentication.Commands;

namespace VibeTunes.Application.UseCases.Authentication.Events;

public class RefreshTokenHandler(
    IAuthService authService
    ) : IRequestHandler<RefreshTokenCommand, string>
{
    public async Task<string> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var newtoken = await authService.RefreshTokenAsync(request.RefreshToken);
        if (newtoken is null)
            throw new BusinessException("Invalid refresh token");
        
        return newtoken;
    }
}